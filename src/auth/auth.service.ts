import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto, LoginUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) { }

    /**
     * Handles User Registration
     * Note: UserService now handles the "email already exists" check.
     */
    async register(createUserDto: CreateUserDto) {
        const user = await this.userService.create(createUserDto)
        
        // Include user details (excluding password) in token payload
        const payload = { sub: user.id, email: user.email, role: user.role }
        
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        };
    }

    /**
     * Handles User Login
     * Note: UserService now throws UnauthorizedException for invalid credentials.
     */
    async login(loginUserDto: LoginUserDto) {
        const user = await this.userService.login(loginUserDto)
        
        const payload = { sub: user.id, email: user.email, role: user.role }
        
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        };
    }
}
