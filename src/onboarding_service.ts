import { z } from "zod";
import { InfraiClient } from "./infrai_client.ts";

const requestSchema = z.object({
  inviteCode: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  idempotency_key: z.string().min(1)
});

const invites = new Set(["COMMUNITY-2026"]);

export type OnboardingResult = { userId: string; sessionId: string };

export async function onboard(
  raw: unknown,
  infrai: Pick<InfraiClient, "request"> = new InfraiClient()
): Promise<OnboardingResult> {
  const input = requestSchema.parse(raw);
  if (!invites.has(input.inviteCode)) throw new Error("INVITE_CODE_REJECTED");

  const user = await infrai.request<{ user_id: string }>("/v1/auth/user/create", "POST", {
    email: input.email,
    password: input.password,
    name: input.name,
    metadata: { inviteCode: input.inviteCode },
    vendor: "in-house",
    mode: "default_vendor",
    idempotency_key: input.idempotency_key
  });
  const session = await infrai.request<{ session_id: string }>("/v1/auth/session/create", "POST", {
    user_id: user.user_id,
    method: "password",
    require_mfa: false
  });
  return { userId: user.user_id, sessionId: session.session_id };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = await onboard({
    inviteCode: process.env.INVITE_CODE ?? "COMMUNITY-2026",
    email: process.env.CUSTOMER_EMAIL ?? "buyer@example.com",
    password: process.env.CUSTOMER_PASSWORD ?? "choose-a-local-password",
    name: process.env.CUSTOMER_NAME ?? "Community buyer",
    idempotency_key: process.env.ONBOARDING_KEY ?? "demo-onboarding-1"
  });
  console.log(JSON.stringify(result));
}
