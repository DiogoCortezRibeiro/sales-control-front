"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
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
    const produtos = [
        { nome: 'Camiseta Básica P', sku: 'CAM-P-001', categoria: 'Roupas', precoVenda: 49.90, custo: 20.00, estoqueAtual: 50, estoqueMinimo: 5 },
        { nome: 'Camiseta Básica M', sku: 'CAM-M-001', categoria: 'Roupas', precoVenda: 49.90, custo: 20.00, estoqueAtual: 50, estoqueMinimo: 5 },
        { nome: 'Calça Jeans 38', sku: 'CAL-38-001', categoria: 'Roupas', precoVenda: 129.90, custo: 60.00, estoqueAtual: 30, estoqueMinimo: 3 },
        { nome: 'Tênis Casual 38', sku: 'TEN-38-001', categoria: 'Calçados', precoVenda: 199.90, custo: 90.00, estoqueAtual: 20, estoqueMinimo: 2 },
        { nome: 'Bolsa de Couro', sku: 'BOL-001', categoria: 'Acessórios', precoVenda: 89.90, custo: 35.00, estoqueAtual: 15, estoqueMinimo: 2 },
    ];
    for (const p of produtos) {
        await prisma.produto.upsert({
            where: { sku: p.sku },
            update: {},
            create: {
                ...p,
                precoVenda: p.precoVenda,
                custo: p.custo,
                ativo: true,
            },
        });
    }
    console.log('✅ Produtos de exemplo criados');
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
//# sourceMappingURL=seed.js.map