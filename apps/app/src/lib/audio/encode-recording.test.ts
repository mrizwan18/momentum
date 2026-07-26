import { afterEach, describe, expect, it, vi } from "vitest";
import { encodeRecordingForAnalysis } from "./encode-recording";

class FakeAudioBuffer {
  numberOfChannels = 1;
  constructor(
    public length: number,
    public sampleRate: number,
    private data: Float32Array = new Float32Array(length),
  ) {}
  getChannelData(): Float32Array {
    return this.data;
  }
  copyToChannel(source: Float32Array): void {
    this.data.set(source);
  }
}

let decodeAudioDataMock: ReturnType<typeof vi.fn>;

class FakeAudioContext {
  decodeAudioData(arrayBuffer: ArrayBuffer) {
    return decodeAudioDataMock(arrayBuffer);
  }
  async close() {}
}

class FakeOfflineAudioContext {
  constructor(
    public numberOfChannels: number,
    public length: number,
    public sampleRate: number,
  ) {}
  createBuffer(channels: number, length: number, sampleRate: number) {
    return new FakeAudioBuffer(length, sampleRate);
  }
  createBufferSource() {
    return {
      buffer: null as FakeAudioBuffer | null,
      connect: vi.fn(),
      start: vi.fn(),
    };
  }
  async startRendering() {
    return new FakeAudioBuffer(this.length, this.sampleRate);
  }
  destination = {};
}

function stubWebAudio() {
  vi.stubGlobal("AudioContext", FakeAudioContext);
  vi.stubGlobal("OfflineAudioContext", FakeOfflineAudioContext);
}

describe("encodeRecordingForAnalysis", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns null when the Web Audio API isn't available", async () => {
    vi.stubGlobal("AudioContext", undefined);
    vi.stubGlobal("OfflineAudioContext", undefined);

    const result = await encodeRecordingForAnalysis(
      new Blob(["fake"], { type: "audio/webm" }),
      60,
    );
    expect(result).toBeNull();
  });

  it("returns null (never throws) when decoding fails", async () => {
    stubWebAudio();
    decodeAudioDataMock = vi.fn().mockRejectedValue(new Error("corrupt audio"));

    const result = await encodeRecordingForAnalysis(
      new Blob(["fake"], { type: "audio/webm" }),
      60,
    );
    expect(result).toBeNull();
  });

  it("encodes a short recording without truncation", async () => {
    stubWebAudio();
    const sampleRate = 48000;
    const durationSeconds = 5;
    decodeAudioDataMock = vi
      .fn()
      .mockResolvedValue(
        new FakeAudioBuffer(sampleRate * durationSeconds, sampleRate),
      );

    const result = await encodeRecordingForAnalysis(
      new Blob(["fake"], { type: "audio/webm" }),
      60,
    );

    expect(result).not.toBeNull();
    expect(result?.format).toBe("wav");
    expect(result?.truncated).toBe(false);
    expect(result?.durationSeconds).toBeCloseTo(durationSeconds, 1);
    expect(result?.base64.length).toBeGreaterThan(0);
  });

  it("truncates a recording longer than the cap and reports it", async () => {
    stubWebAudio();
    const sampleRate = 48000;
    const durationSeconds = 180; // 3 minutes
    decodeAudioDataMock = vi
      .fn()
      .mockResolvedValue(
        new FakeAudioBuffer(sampleRate * durationSeconds, sampleRate),
      );

    const result = await encodeRecordingForAnalysis(
      new Blob(["fake"], { type: "audio/webm" }),
      60,
    );

    expect(result).not.toBeNull();
    expect(result?.truncated).toBe(true);
    expect(result?.durationSeconds).toBeCloseTo(60, 0);
  });
});
