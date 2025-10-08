import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export async function ensureConnected() {
    try {
        await prisma.$connect();
        console.log("✅ Connected to database");
    } catch (err) {
        console.error("❌ Database connection failed:", err);
        process.exit(1);
    }
}
