import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        usuario: {
            id: string;
            nome: string;
            email: string;
            role: "ADMIN";
        };
    }>;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
    }>;
    me(userId: string): Promise<{
        id: string;
        email: string;
        nome: string;
        role: "ADMIN";
        createdAt: Date;
    }>;
}
