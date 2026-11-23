import test from "node:test";
import assert from "node:assert/strict";
import { onboard } from "./onboarding_service.ts";

test("accepted invite creates a customer session", async () => {
  const calls: string[] = [];
  const fake = {
    request: async <T>(path: string): Promise<T> => {
      calls.push(path);
      return (path.includes("user/create") ? { user_id: "user-7" } : { session_id: "session-7" }) as T;
    }
  };
  const result = await onboard({ inviteCode: "COMMUNITY-2026", email: "buyer@example.com", password: "password-123", name: "Buyer", idempotency_key: "signup-7" }, fake);
  assert.deepEqual(result, { userId: "user-7", sessionId: "session-7" });
  assert.deepEqual(calls, ["/v1/auth/user/create", "/v1/auth/session/create"]);
});

test("unknown invite stops before account creation", async () => {
  await assert.rejects(() => onboard({ inviteCode: "NOPE", email: "buyer@example.com", password: "password-123", name: "Buyer", idempotency_key: "signup-8" }));
});
