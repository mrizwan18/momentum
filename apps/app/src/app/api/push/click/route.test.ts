import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const markNotificationClicked = vi.fn();
vi.mock("@/lib/push/store", () => ({
  getPushStore: () => ({ markNotificationClicked }),
}));

const { POST } = await import("./route");

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/push/click", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("POST /api/push/click", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("marks a notification as clicked", async () => {
    const response = await POST(makeRequest({ notificationId: "notif-1" }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(markNotificationClicked).toHaveBeenCalledWith("notif-1");
  });

  it("rejects a body without a notificationId", async () => {
    const response = await POST(makeRequest({}));
    expect(response.status).toBe(400);
    expect(markNotificationClicked).not.toHaveBeenCalled();
  });
});
