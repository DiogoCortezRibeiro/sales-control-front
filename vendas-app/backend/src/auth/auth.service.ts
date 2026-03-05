import {
    Injectable,
    UnauthorizedException,
    NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async login(dto: LoginDto) {
        const usuario = await this.prisma.usuario.findUnique({
            where: { email: dto.email },
        });

        if (!usuario) {
            throw new UnauthorizedException('Credenciais inválidas');
        }

        const senhaValida = await bcrypt.compare(dto.senha, usuario.senhaHash);
        if (!senhaValida) {
            throw new UnauthorizedException('Credenciais inválidas');
        }

        const payload = { sub: usuario.id, email: usuario.email, role: usuario.role };
        const accessToken = this.jwtService.sign(payload, { expiresIn: '8h' });
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

        return {
            accessToken,
            refreshToken,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                role: usuario.role,
            },
        };
    }

    async refresh(refreshToken: string) {
        try {
            const payload = this.jwtService.verify(refreshToken);
            const newPayload = { sub: payload.sub, email: payload.email, role: payload.role };
            const accessToken = this.jwtService.sign(newPayload, { expiresIn: '8h' });
            return { accessToken };
        } catch {
            throw new UnauthorizedException('Token inválido ou expirado');
        }
    }

    async me(userId: string) {
        const usuario = await this.prisma.usuario.findUnique({
            where: { id: userId },
            select: { id: true, nome: true, email: true, role: true, createdAt: true },
        });

        if (!usuario) {
            throw new NotFoundException('Usuário não encontrado');
        }

        return usuario;
    }
}
