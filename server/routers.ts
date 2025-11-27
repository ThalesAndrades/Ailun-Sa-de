import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getRapidocClient } from "./rapidoc";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

// Procedure que requer admin
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============= BENEFICIÁRIOS =============
  beneficiaries: router({
    list: adminProcedure
      .input(z.object({ search: z.string().optional() }).optional())
      .query(async ({ input }) => {
        const search = input?.search;
        return await db.listBeneficiaries(search);
      }),

    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const beneficiary = await db.getBeneficiaryById(input.id);
        if (!beneficiary) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Beneficiário não encontrado' });
        }
        return beneficiary;
      }),

    getByCpf: adminProcedure
      .input(z.object({ cpf: z.string() }))
      .query(async ({ input }) => {
        // Buscar primeiro no banco local
        const local = await db.getBeneficiaryByCpf(input.cpf);
        if (local) return local;

        // Se não encontrar, buscar na Rapidoc
        const rapidoc = getRapidocClient();
        if (!rapidoc.isConfigured()) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'API Rapidoc não configurada' });
        }

        try {
          const data = await rapidoc.getBeneficiaryByCpf(input.cpf);
          // Salvar no banco local
          if (data.uuid) {
            await db.createBeneficiary({
              uuid: data.uuid,
              cpf: data.cpf,
              name: data.name,
              email: data.email,
              phone: data.phone,
              birthDate: data.birthDate,
              gender: data.gender,
              rapidocData: JSON.stringify(data),
            });
          }
          return data;
        } catch (error) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Beneficiário não encontrado' });
        }
      }),

    create: adminProcedure
      .input(z.object({
        cpf: z.string(),
        name: z.string(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        birthDate: z.string().optional(),
        gender: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const rapidoc = getRapidocClient();
        if (!rapidoc.isConfigured()) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'API Rapidoc não configurada' });
        }

        try {
          const data = await rapidoc.createBeneficiary(input);
          
          // Salvar no banco local
          const beneficiary = await db.createBeneficiary({
            uuid: data.uuid,
            cpf: input.cpf,
            name: input.name,
            email: input.email,
            phone: input.phone,
            birthDate: input.birthDate,
            gender: input.gender,
            rapidocData: JSON.stringify(data),
          });

          return beneficiary;
        } catch (error: any) {
          throw new TRPCError({ 
            code: 'INTERNAL_SERVER_ERROR', 
            message: error.response?.data?.message || 'Erro ao criar beneficiário' 
          });
        }
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        birthDate: z.string().optional(),
        gender: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const beneficiary = await db.getBeneficiaryById(input.id);
        if (!beneficiary) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Beneficiário não encontrado' });
        }

        const rapidoc = getRapidocClient();
        if (!rapidoc.isConfigured()) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'API Rapidoc não configurada' });
        }

        try {
          const { id, ...updateData } = input;
          await rapidoc.updateBeneficiary(beneficiary.uuid, updateData);
          
          // Atualizar no banco local
          const updated = await db.updateBeneficiary(id, updateData);
          return updated;
        } catch (error: any) {
          throw new TRPCError({ 
            code: 'INTERNAL_SERVER_ERROR', 
            message: error.response?.data?.message || 'Erro ao atualizar beneficiário' 
          });
        }
      }),

    inactivate: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const beneficiary = await db.getBeneficiaryById(input.id);
        if (!beneficiary) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Beneficiário não encontrado' });
        }

        const rapidoc = getRapidocClient();
        if (!rapidoc.isConfigured()) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'API Rapidoc não configurada' });
        }

        try {
          await rapidoc.inactivateBeneficiary(beneficiary.uuid);
          
          // Atualizar no banco local
          await db.updateBeneficiary(input.id, { active: false });
          return { success: true };
        } catch (error: any) {
          throw new TRPCError({ 
            code: 'INTERNAL_SERVER_ERROR', 
            message: error.response?.data?.message || 'Erro ao inativar beneficiário' 
          });
        }
      }),

    requestAppointmentUrl: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const beneficiary = await db.getBeneficiaryById(input.id);
        if (!beneficiary) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Beneficiário não encontrado' });
        }

        const rapidoc = getRapidocClient();
        if (!rapidoc.isConfigured()) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'API Rapidoc não configurada' });
        }

        try {
          const data = await rapidoc.requestAppointmentUrl(beneficiary.uuid);
          return data;
        } catch (error: any) {
          throw new TRPCError({ 
            code: 'INTERNAL_SERVER_ERROR', 
            message: error.response?.data?.message || 'Erro ao solicitar URL de agendamento' 
          });
        }
      }),

    sync: adminProcedure
      .mutation(async () => {
        const rapidoc = getRapidocClient();
        if (!rapidoc.isConfigured()) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'API Rapidoc não configurada' });
        }

        try {
          const data = await rapidoc.listBeneficiaries();
          let synced = 0;

          for (const item of data.beneficiaries || []) {
            const existing = await db.getBeneficiaryByUuid(item.uuid);
            if (!existing) {
              await db.createBeneficiary({
                uuid: item.uuid,
                cpf: item.cpf,
                name: item.name,
                email: item.email,
                phone: item.phone,
                birthDate: item.birthDate,
                gender: item.gender,
                rapidocData: JSON.stringify(item),
              });
              synced++;
            }
          }

          return { success: true, synced };
        } catch (error: any) {
          throw new TRPCError({ 
            code: 'INTERNAL_SERVER_ERROR', 
            message: error.response?.data?.message || 'Erro ao sincronizar beneficiários' 
          });
        }
      }),
  }),

  // ============= ESPECIALIDADES =============
  specialties: router({
    list: adminProcedure.query(async () => {
      return await db.listSpecialties();
    }),

    checkAvailability: adminProcedure
      .input(z.object({
        specialtyId: z.string(),
        date: z.string(),
      }))
      .query(async ({ input }) => {
        const rapidoc = getRapidocClient();
        if (!rapidoc.isConfigured()) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'API Rapidoc não configurada' });
        }

        try {
          const data = await rapidoc.checkSpecialtyAvailability(input.specialtyId, input.date);
          return data;
        } catch (error: any) {
          throw new TRPCError({ 
            code: 'INTERNAL_SERVER_ERROR', 
            message: error.response?.data?.message || 'Erro ao verificar disponibilidade' 
          });
        }
      }),

    sync: adminProcedure
      .mutation(async () => {
        const rapidoc = getRapidocClient();
        if (!rapidoc.isConfigured()) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'API Rapidoc não configurada' });
        }

        try {
          const data = await rapidoc.listSpecialties();
          let synced = 0;

          for (const item of data.specialties || []) {
            await db.upsertSpecialty({
              rapidocId: item.id,
              name: item.name,
              description: item.description,
              available: item.available,
            });
            synced++;
          }

          return { success: true, synced };
        } catch (error: any) {
          throw new TRPCError({ 
            code: 'INTERNAL_SERVER_ERROR', 
            message: error.response?.data?.message || 'Erro ao sincronizar especialidades' 
          });
        }
      }),
  }),

  // ============= AGENDAMENTOS =============
  appointments: router({
    list: adminProcedure.query(async () => {
      return await db.listAppointments();
    }),

    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const appointment = await db.getAppointmentById(input.id);
        if (!appointment) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Agendamento não encontrado' });
        }
        return appointment;
      }),

    create: adminProcedure
      .input(z.object({
        beneficiaryId: z.number(),
        specialtyId: z.string(),
        date: z.string(),
        time: z.string(),
        notes: z.string().optional(),
        referralCode: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const beneficiary = await db.getBeneficiaryById(input.beneficiaryId);
        if (!beneficiary) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Beneficiário não encontrado' });
        }

        const rapidoc = getRapidocClient();
        if (!rapidoc.isConfigured()) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'API Rapidoc não configurada' });
        }

        try {
          const data = input.referralCode
            ? await rapidoc.createAppointmentWithReferral({
                beneficiaryUuid: beneficiary.uuid,
                specialtyId: input.specialtyId,
                date: input.date,
                time: input.time,
                referralCode: input.referralCode,
                notes: input.notes,
              })
            : await rapidoc.createAppointment({
                beneficiaryUuid: beneficiary.uuid,
                specialtyId: input.specialtyId,
                date: input.date,
                time: input.time,
                notes: input.notes,
              });

          // Salvar no banco local
          const appointment = await db.createAppointment({
            uuid: data.uuid,
            beneficiaryId: input.beneficiaryId,
            specialtyId: input.specialtyId,
            specialtyName: data.specialtyName,
            scheduledDate: new Date(`${input.date}T${input.time}`),
            status: 'pending',
            notes: input.notes,
            rapidocData: JSON.stringify(data),
          });

          return appointment;
        } catch (error: any) {
          throw new TRPCError({ 
            code: 'INTERNAL_SERVER_ERROR', 
            message: error.response?.data?.message || 'Erro ao criar agendamento' 
          });
        }
      }),

    confirm: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const appointment = await db.getAppointmentById(input.id);
        if (!appointment) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Agendamento não encontrado' });
        }

        const rapidoc = getRapidocClient();
        if (!rapidoc.isConfigured()) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'API Rapidoc não configurada' });
        }

        try {
          await rapidoc.confirmAppointment(appointment.uuid);
          
          // Atualizar no banco local
          await db.updateAppointment(input.id, { status: 'confirmed' });
          return { success: true };
        } catch (error: any) {
          throw new TRPCError({ 
            code: 'INTERNAL_SERVER_ERROR', 
            message: error.response?.data?.message || 'Erro ao confirmar agendamento' 
          });
        }
      }),

    cancel: adminProcedure
      .input(z.object({ 
        id: z.number(),
        reason: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const appointment = await db.getAppointmentById(input.id);
        if (!appointment) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Agendamento não encontrado' });
        }

        const rapidoc = getRapidocClient();
        if (!rapidoc.isConfigured()) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'API Rapidoc não configurada' });
        }

        try {
          await rapidoc.cancelAppointment(appointment.uuid, input.reason);
          
          // Atualizar no banco local
          await db.updateAppointment(input.id, { status: 'cancelled' });
          return { success: true };
        } catch (error: any) {
          throw new TRPCError({ 
            code: 'INTERNAL_SERVER_ERROR', 
            message: error.response?.data?.message || 'Erro ao cancelar agendamento' 
          });
        }
      }),
  }),

  // ============= DASHBOARD =============
  dashboard: router({
    stats: adminProcedure.query(async () => {
      const beneficiaries = await db.listBeneficiaries();
      const appointments = await db.listAppointments();

      return {
        totalBeneficiaries: beneficiaries.length,
        activeBeneficiaries: beneficiaries.filter(b => b.active).length,
        totalAppointments: appointments.length,
        pendingAppointments: appointments.filter(a => a.status === 'pending').length,
        confirmedAppointments: appointments.filter(a => a.status === 'confirmed').length,
        cancelledAppointments: appointments.filter(a => a.status === 'cancelled').length,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
