import { eq, like, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  beneficiaries, 
  Beneficiary, 
  InsertBeneficiary,
  appointments,
  Appointment,
  InsertAppointment,
  specialties,
  Specialty,
  InsertSpecialty
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============= USER HELPERS =============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============= BENEFICIARY HELPERS =============

export async function listBeneficiaries(search?: string): Promise<Beneficiary[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    let query = db.select().from(beneficiaries).orderBy(desc(beneficiaries.createdAt));
    
    if (search) {
      query = query.where(like(beneficiaries.name, `%${search}%`)) as any;
    }

    return await query;
  } catch (error) {
    console.error("[Database] Failed to list beneficiaries:", error);
    return [];
  }
}

export async function getBeneficiaryById(id: number): Promise<Beneficiary | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  try {
    const result = await db.select().from(beneficiaries).where(eq(beneficiaries.id, id)).limit(1);
    return result[0];
  } catch (error) {
    console.error("[Database] Failed to get beneficiary:", error);
    return undefined;
  }
}

export async function getBeneficiaryByUuid(uuid: string): Promise<Beneficiary | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  try {
    const result = await db.select().from(beneficiaries).where(eq(beneficiaries.uuid, uuid)).limit(1);
    return result[0];
  } catch (error) {
    console.error("[Database] Failed to get beneficiary by UUID:", error);
    return undefined;
  }
}

export async function getBeneficiaryByCpf(cpf: string): Promise<Beneficiary | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  try {
    const result = await db.select().from(beneficiaries).where(eq(beneficiaries.cpf, cpf)).limit(1);
    return result[0];
  } catch (error) {
    console.error("[Database] Failed to get beneficiary by CPF:", error);
    return undefined;
  }
}

export async function createBeneficiary(data: InsertBeneficiary): Promise<Beneficiary> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db.insert(beneficiaries).values(data);
    const id = Number(result[0].insertId);
    const created = await getBeneficiaryById(id);
    if (!created) throw new Error("Failed to retrieve created beneficiary");
    return created;
  } catch (error) {
    console.error("[Database] Failed to create beneficiary:", error);
    throw error;
  }
}

export async function updateBeneficiary(id: number, data: Partial<InsertBeneficiary>): Promise<Beneficiary | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  try {
    await db.update(beneficiaries).set(data).where(eq(beneficiaries.id, id));
    return await getBeneficiaryById(id);
  } catch (error) {
    console.error("[Database] Failed to update beneficiary:", error);
    return undefined;
  }
}

// ============= APPOINTMENT HELPERS =============

export async function listAppointments(): Promise<Appointment[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(appointments).orderBy(desc(appointments.scheduledDate));
  } catch (error) {
    console.error("[Database] Failed to list appointments:", error);
    return [];
  }
}

export async function getAppointmentById(id: number): Promise<Appointment | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  try {
    const result = await db.select().from(appointments).where(eq(appointments.id, id)).limit(1);
    return result[0];
  } catch (error) {
    console.error("[Database] Failed to get appointment:", error);
    return undefined;
  }
}

export async function createAppointment(data: InsertAppointment): Promise<Appointment> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db.insert(appointments).values(data);
    const id = Number(result[0].insertId);
    const created = await getAppointmentById(id);
    if (!created) throw new Error("Failed to retrieve created appointment");
    return created;
  } catch (error) {
    console.error("[Database] Failed to create appointment:", error);
    throw error;
  }
}

export async function updateAppointment(id: number, data: Partial<InsertAppointment>): Promise<Appointment | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  try {
    await db.update(appointments).set(data).where(eq(appointments.id, id));
    return await getAppointmentById(id);
  } catch (error) {
    console.error("[Database] Failed to update appointment:", error);
    return undefined;
  }
}

// ============= SPECIALTY HELPERS =============

export async function listSpecialties(): Promise<Specialty[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(specialties).orderBy(desc(specialties.name));
  } catch (error) {
    console.error("[Database] Failed to list specialties:", error);
    return [];
  }
}

export async function upsertSpecialty(data: InsertSpecialty): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db.insert(specialties).values(data).onDuplicateKeyUpdate({
      set: {
        name: data.name,
        description: data.description,
        available: data.available,
      },
    });
  } catch (error) {
    console.error("[Database] Failed to upsert specialty:", error);
    throw error;
  }
}
