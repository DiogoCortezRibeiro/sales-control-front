import { Controller, Put, Param, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('sales/:saleId/parcelas')
export class ParcelasController {
    constructor(private prisma: PrismaService) { }

    @Put(':parcelaId/pay')
    async payParcela(
        @Param('saleId') saleId: string,
        @Param('parcelaId') parcelaId: string,
    ) {
        const parcela = await this.prisma.parcela.findUnique({
            where: { id: parcelaId },
            include: { venda: true },
        });

        if (!parcela) {
            throw new NotFoundException('Parcela não encontrada');
        }

        if (parcela.vendaId !== saleId) {
            throw new BadRequestException('Parcela não pertence a esta venda');
        }

        if (parcela.status === 'PAGA') {
            throw new BadRequestException('Esta parcela já está paga');
        }

        const updated = await this.prisma.parcela.update({
            where: { id: parcelaId },
            data: {
                status: 'PAGA',
                dataPagamento: new Date(),
            },
        });

        return { message: 'Parcela marcada como paga com sucesso', parcela: updated };
    }
}
