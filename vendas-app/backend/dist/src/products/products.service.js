"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProductsService = class ProductsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 20;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.search) {
            where.OR = [
                { nome: { contains: query.search, mode: 'insensitive' } },
                { sku: { contains: query.search, mode: 'insensitive' } },
                { categoria: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        if (query.ativo !== undefined) {
            where.ativo = query.ativo === 'true';
        }
        const [data, total] = await Promise.all([
            this.prisma.produto.findMany({
                where,
                skip,
                take: limit,
                orderBy: { nome: 'asc' },
            }),
            this.prisma.produto.count({ where }),
        ]);
        return {
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async findOne(id) {
        const produto = await this.prisma.produto.findUnique({ where: { id } });
        if (!produto)
            throw new common_1.NotFoundException('Produto não encontrado');
        return produto;
    }
    async create(dto) {
        const exists = await this.prisma.produto.findUnique({ where: { sku: dto.sku } });
        if (exists)
            throw new common_1.ConflictException('SKU já cadastrado');
        return this.prisma.produto.create({ data: dto });
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.produto.update({ where: { id }, data: dto });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.produto.update({
            where: { id },
            data: { ativo: false },
        });
    }
    async getLowStock() {
        return this.prisma.produto.findMany({
            where: {
                ativo: true,
                estoqueMinimo: { not: null },
                estoqueAtual: { lte: this.prisma.produto.fields.estoqueMinimo },
            },
        });
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map