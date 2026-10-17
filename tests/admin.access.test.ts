import { describe, expect, it } from "vitest";
import { appRouter } from "../server/routers";
import type { TrpcContext } from "../server/_core/context";
import type { User } from "../drizzle/schema";

function makeContext(role: "admin" | "user" | null): TrpcContext {
  const user: User | null = role ? {
    id: 1,
    openId: "sample-user",
    name: "Sample User",
    email: "sample@example.com",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  } : null;
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("admin.access", () => {
  it("allows an authenticated admin", async () => {
    const caller = appRouter.createCaller(makeContext("admin"));
    await expect(caller.admin.access()).resolves.toMatchObject({ allowed: true, adminName: "Sample User" });
  });

  it("rejects a regular user on the server", async () => {
    const caller = appRouter.createCaller(makeContext("user"));
    await expect(caller.admin.access()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects an unauthenticated visitor on the server", async () => {
    const caller = appRouter.createCaller(makeContext(null));
    await expect(caller.admin.access()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
