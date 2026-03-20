import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from 'src/user/dto/create-user.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) { }

    @Post('register')
    async register(@Body() createUserDto: CreateUserDto) {
        const result = await this.authService.register(createUserDto);
        return {
            message: "User registered successfully",
            ...result
        };
    }

    @Post('login')
    async login(@Body() loginUserDto: LoginUserDto) {
        const result = await this.authService.login(loginUserDto);
        return {
            message: "Login success",
            ...result
        };
    }
}
