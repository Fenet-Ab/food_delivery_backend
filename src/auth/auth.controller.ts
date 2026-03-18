import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from 'src/user/dto/create-user.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) { }
    @Post('register')
    async register(@Body() createUserDto: CreateUserDto) {
        const user = await this.authService.register(createUserDto)
        try {
            return {
                message: "user registered successfully",
                user: user
            }
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
        }
    };
    @Post('login')
    async login(@Body() loginUserDto: LoginUserDto) {
        const token = await this.authService.login(loginUserDto);
        return {
            message: "Login success",
            token: token.access_token
        }
    }

}
