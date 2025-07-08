import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const username = 'admin';
    const password = 'admin123';
    const name = 'Administrator';

    const existingAdmin = await prisma.user.findUnique({
        where: { username },
    });

    if (existingAdmin) {
        console.log('Admin korisnik već postoji:', existingAdmin.username);
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const adminUser = await prisma.user.create({
        data: {
            username,
            password: hashedPassword,
            name,
            role: 'admin',
        },
    });

    console.log('Admin korisnik kreiran:', adminUser);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
