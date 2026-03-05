import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
    me(req: any): Promise<{
        id: string;
        email: string;
        nome: string;
        role: "ADMIN";
        createdAt: Date;
    }>;
}
