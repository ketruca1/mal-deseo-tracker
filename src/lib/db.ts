import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

function createPrismaClient() {
  const url = process.env.DATABASE_URL || ''

  // If DATABASE_URL starts with "libsql:", use the Turso adapter
  if (url.startsWith('libsql:')) {
    const authToken = process.env.DATABASE_AUTH_TOKEN

    const adapter = new PrismaLibSql({
      url,
      authToken,
    })

    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['error'] : [],
    })
  }

  // Local development: standard SQLite
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error'] : [],
  })
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db