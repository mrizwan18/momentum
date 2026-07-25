import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const deleteSubscriber = vi.fn();
vi.mock("@/lib/push/store", () => ({
  getPushStore: () => ({ deleteSubscriber }),
}));

const { POST } = await import("./route");

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/push/unsubscribe", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("POST /api/push/unsubscribe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes the subscriber for a valid deviceId", async () => {
    const response = await POST(makeRequest({ deviceId: "device-1" }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(deleteSubscriber).toHaveBeenCalledWith("device-1");
  });

  it("rejects a body without a deviceId", async () => {
    const response = await POST(makeRequest({}));
    expect(response.status).toBe(400);
    expect(deleteSubscriber).not.toHaveBeenCalled();
  });
});
