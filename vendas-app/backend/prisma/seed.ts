import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // Criar admin padrão
    const senhaHash = await bcrypt.hash('admin123', 10);

    const admin = await prisma.usuario.upsert({
        where: { email: 'admin@vendas.com' },
        update: {},
        create: {
            nome: 'Administrador',
            email: 'admin@vendas.com',
            senhaHash,
            role: 'ADMIN',
        },
    });

    console.log('✅ Admin criado:', admin.email);

    // Criar algumas categorias de produtos de exemplo
    const produtos = [
        { nome: 'Camiseta Básica P', categoria: 'Roupas', precoVenda: 49.90, custo: 20.00, estoqueAtual: 50, estoqueMinimo: 5 },
        { nome: 'Camiseta Básica M', categoria: 'Roupas', precoVenda: 49.90, custo: 20.00, estoqueAtual: 50, estoqueMinimo: 5 },
        { nome: 'Calça Jeans 38', categoria: 'Roupas', precoVenda: 129.90, custo: 60.00, estoqueAtual: 30, estoqueMinimo: 3 },
        { nome: 'Tênis Casual 38', categoria: 'Calçados', precoVenda: 199.90, custo: 90.00, estoqueAtual: 20, estoqueMinimo: 2 },
        { nome: 'Bolsa de Couro', categoria: 'Acessórios', precoVenda: 89.90, custo: 35.00, estoqueAtual: 15, estoqueMinimo: 2 },
    ];

    for (const p of produtos) {
        // Find existing product by name since we removed sku
        const existing = await prisma.produto.findFirst({ where: { nome: p.nome } });
        if (existing) {
            await prisma.produto.update({
                where: { id: existing.id },
                data: { ...p, ativo: true }
            });
        } else {
            await prisma.produto.create({
                data: { ...p, ativo: true }
            });
        }
    }

    console.log('✅ Produtos de exemplo criados');

    // Criar clientes de exemplo
    const clientes = [
        { nome: 'Maria Silva', telefone: '(11) 99999-0001', email: 'maria@email.com' },
        { nome: 'João Santos', telefone: '(11) 99999-0002', email: 'joao@email.com' },
        { nome: 'Ana Oliveira', telefone: '(11) 99999-0003' },
    ];

    for (const c of clientes) {
        const exists = await prisma.cliente.findFirst({ where: { telefone: c.telefone } });
        if (!exists) {
            await prisma.cliente.create({ data: c });
        }
    }

    console.log('✅ Clientes de exemplo criados');
    console.log('\n🚀 Seed concluído!');
    console.log('📧 Email: admin@vendas.com');
    console.log('🔐 Senha: admin123');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
