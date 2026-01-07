/* eslint-disable */
// @ts-nocheck
// PHASE 1: Prisma is optional for demo build
// This file is kept for Phase 2 when Prisma will be enabled
// Type checking disabled to allow build without Prisma Client

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Prisma Client may not be generated
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Prisma Client may not be available
export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

