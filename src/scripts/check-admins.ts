
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const allUsers = await prisma.user.findMany();
    console.log('All Users:', JSON.stringify(allUsers, null, 2));
    const adminCount = await prisma.user.count({ where: { role: 'admin' } });
    console.log('Admin Count:', adminCount);
}
main().finally(() => prisma.$disconnect());
