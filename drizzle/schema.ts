import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Beneficiários (pacientes) do sistema
 */
export const beneficiaries = mysqlTable("beneficiaries", {
  id: int("id").autoincrement().primaryKey(),
  uuid: varchar("uuid", { length: 64 }).notNull().unique(), // UUID da Rapidoc
  cpf: varchar("cpf", { length: 14 }).notNull().unique(),
  name: text("name").notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  birthDate: varchar("birthDate", { length: 10 }), // formato: YYYY-MM-DD
  gender: varchar("gender", { length: 20 }),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  // Campos adicionais da Rapidoc
  rapidocData: text("rapidocData"), // JSON com dados completos da Rapidoc
});

export type Beneficiary = typeof beneficiaries.$inferSelect;
export type InsertBeneficiary = typeof beneficiaries.$inferInsert;

/**
 * Agendamentos de consultas
 */
export const appointments = mysqlTable("appointments", {
  id: int("id").autoincrement().primaryKey(),
  uuid: varchar("uuid", { length: 64 }).notNull().unique(), // UUID da Rapidoc
  beneficiaryId: int("beneficiaryId").notNull(),
  specialtyId: varchar("specialtyId", { length: 64 }),
  specialtyName: text("specialtyName"),
  scheduledDate: timestamp("scheduledDate").notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "cancelled", "completed"]).default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  // Campos adicionais da Rapidoc
  rapidocData: text("rapidocData"), // JSON com dados completos da Rapidoc
});

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;

/**
 * Especialidades médicas disponíveis
 */
export const specialties = mysqlTable("specialties", {
  id: int("id").autoincrement().primaryKey(),
  rapidocId: varchar("rapidocId", { length: 64 }).notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  available: boolean("available").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Specialty = typeof specialties.$inferSelect;
export type InsertSpecialty = typeof specialties.$inferInsert;
