import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@ailun.com.br",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@ailun.com.br",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Beneficiaries Router", () => {
  describe("Authorization", () => {
    it("should allow admin to list beneficiaries", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.beneficiaries.list();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should deny regular user access to beneficiaries", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.beneficiaries.list()).rejects.toThrow("Admin access required");
    });
  });

  describe("Dashboard Stats", () => {
    it("should return dashboard statistics for admin", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const stats = await caller.dashboard.stats();
      
      expect(stats).toHaveProperty("totalBeneficiaries");
      expect(stats).toHaveProperty("activeBeneficiaries");
      expect(stats).toHaveProperty("totalAppointments");
      expect(stats).toHaveProperty("pendingAppointments");
      expect(stats).toHaveProperty("confirmedAppointments");
      expect(stats).toHaveProperty("cancelledAppointments");
      
      expect(typeof stats.totalBeneficiaries).toBe("number");
      expect(typeof stats.activeBeneficiaries).toBe("number");
      expect(typeof stats.totalAppointments).toBe("number");
    });

    it("should deny regular user access to dashboard stats", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.dashboard.stats()).rejects.toThrow("Admin access required");
    });
  });
});

describe("Appointments Router", () => {
  it("should allow admin to list appointments", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.appointments.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should deny regular user access to appointments", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.appointments.list()).rejects.toThrow("Admin access required");
  });
});

describe("Specialties Router", () => {
  it("should allow admin to list specialties", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.specialties.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should deny regular user access to specialties", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.specialties.list()).rejects.toThrow("Admin access required");
  });
});

describe("Auth Router", () => {
  it("should return user info for authenticated user", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const user = await caller.auth.me();
    expect(user).toBeDefined();
    expect(user?.email).toBe("admin@ailun.com.br");
    expect(user?.role).toBe("admin");
  });

  it("should return null for unauthenticated user", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {
        clearCookie: () => {},
      } as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);

    const user = await caller.auth.me();
    expect(user).toBeNull();
  });
});
