const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    // Überprüfe, ob der Test-Benutzer bereits existiert
    const testUser = await prisma.user.findUnique({
        where: { email: 'test@example.com' }
    });

    if (!testUser) {
        const hashedPassword = await hash('test123', 12);
        await prisma.user.create({
            data: {
                name: "Test User",
                email: "test@example.com",
                password: hashedPassword,
                role: "ADMIN"
            }
        });
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 