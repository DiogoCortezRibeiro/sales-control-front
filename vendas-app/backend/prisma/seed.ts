import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // Criar usuários iniciais
    const senhaAdmin = await bcrypt.hash('admin123', 10);
    const admin = await prisma.usuario.upsert({
        where: { email: 'admin@vendas.com' },
        update: {},
        create: {
            nome: 'Administrador',
            email: 'admin@vendas.com',
            senhaHash: senhaAdmin,
            role: 'ADMIN',
        },
    });

    const senhaDany = await bcrypt.hash('dany123*', 10);
    const user2 = await prisma.usuario.upsert({
        where: { email: 'danycortez@gmail.com' },
        update: {},
        create: {
            nome: 'Dany Cortez',
            email: 'danycortez@gmail.com',
            senhaHash: senhaDany,
            role: 'ADMIN',
        },
    });

    console.log('✅ Usuários iniciais criados com sucesso:');
    console.log('📧 admin@vendas.com');
    console.log('📧 danycortez@gmail.com');
    console.log('\n🚀 Sistema pronto para uso!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
