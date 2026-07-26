const TARGET_SAMPLE_RATE = 16000;
const WAV_HEADER_BYTES = 44;
const BASE64_CHUNK_SIZE = 0x8000;

export interface EncodedRecordingAudio {
  base64: string;
  format: "wav";
  durationSeconds: number;
  /** True when the original recording was longer than the requested cap and had to be cut down. */
  truncated: boolean;
}

function sliceAudioBuffer(
  context: BaseAudioContext,
  source: AudioBuffer,
  length: number,
): AudioBuffer {
  const sliced = context.createBuffer(
    source.numberOfChannels,
    length,
    source.sampleRate,
  );
  for (let channel = 0; channel < source.numberOfChannels; channel += 1) {
    sliced.copyToChannel(
      source.getChannelData(channel).subarray(0, length),
      channel,
    );
  }
  return sliced;
}

/** Real audio-analysis providers only accept wav/mp3 — MediaRecorder produces webm/opus, so every recording needs this conversion before it can be sent. */
function encodeWav(buffer: AudioBuffer): Uint8Array {
  const samples = buffer.getChannelData(0);
  const bytesPerSample = 2;
  const dataSize = samples.length * bytesPerSample;
  const arrayBuffer = new ArrayBuffer(WAV_HEADER_BYTES + dataSize);
  const view = new DataView(arrayBuffer);

  function writeString(offset: number, text: string) {
    for (let index = 0; index < text.length; index += 1) {
      view.setUint8(offset + index, text.charCodeAt(index));
    }
  }

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * bytesPerSample, true); // byte rate
  view.setUint16(32, bytesPerSample, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  let offset = WAV_HEADER_BYTES;
  for (let index = 0; index < samples.length; index += 1) {
    const clamped = Math.max(-1, Math.min(1, samples[index]));
    view.setInt16(
      offset,
      clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff,
      true,
    );
    offset += bytesPerSample;
  }

  return new Uint8Array(arrayBuffer);
}

/** Chunked to avoid call-stack overflow from spreading a large typed array into String.fromCharCode. */
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += BASE64_CHUNK_SIZE) {
    const chunk = bytes.subarray(offset, offset + BASE64_CHUNK_SIZE);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

/**
 * Converts a recorded Blob (webm/opus, mp4, etc.) into a 16kHz mono WAV,
 * base64-encoded, ready to attach to an AI Gateway request. Caps the
 * encoded duration at `maxDurationSeconds` to keep the request body small
 * and reliable. Never throws — a browser without the Web Audio API, a
 * corrupt blob, or a decode failure all resolve to `null`, and callers must
 * fall back to a context-only (no audio) request rather than fail outright.
 */
export async function encodeRecordingForAnalysis(
  blob: Blob,
  maxDurationSeconds: number,
): Promise<EncodedRecordingAudio | null> {
  try {
    if (
      typeof AudioContext === "undefined" ||
      typeof OfflineAudioContext === "undefined"
    ) {
      return null;
    }

    const arrayBuffer = await blob.arrayBuffer();
    const audioContext = new AudioContext();
    let decoded: AudioBuffer;
    try {
      decoded = await audioContext.decodeAudioData(arrayBuffer);
    } finally {
      await audioContext.close().catch(() => {});
    }

    const maxSamples = Math.floor(maxDurationSeconds * decoded.sampleRate);
    const truncated = decoded.length > maxSamples;
    const sourceLength = truncated ? maxSamples : decoded.length;
    const renderedLength = Math.max(
      1,
      Math.ceil((sourceLength / decoded.sampleRate) * TARGET_SAMPLE_RATE),
    );

    const offlineContext = new OfflineAudioContext(
      1,
      renderedLength,
      TARGET_SAMPLE_RATE,
    );
    const bufferToRender = truncated
      ? sliceAudioBuffer(offlineContext, decoded, sourceLength)
      : decoded;

    const source = offlineContext.createBufferSource();
    source.buffer = bufferToRender;
    source.connect(offlineContext.destination);
    source.start();
    const rendered = await offlineContext.startRendering();

    const wavBytes = encodeWav(rendered);

    return {
      base64: uint8ArrayToBase64(wavBytes),
      format: "wav",
      durationSeconds: rendered.length / rendered.sampleRate,
      truncated,
    };
  } catch {
    return null;
  }
}
