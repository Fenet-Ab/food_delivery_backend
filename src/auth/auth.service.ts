import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto, LoginUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) { }
    async register(createUserDto: CreateUserDto) {
        const user = await this.userService.create(createUserDto)
        const payload = { sub: user.id, email: user.email, role: user.role }
        return {
            access_token: this.jwtService.sign(payload)
        };
    }
    async login(loginUserDto: LoginUserDto) {
        const user = await this.userService.login(loginUserDto)
        const payload = { sub: user.id, email: user.email, role: user.role }
        return {
            access_token: this.jwtService.sign(payload)
        };
    }
}
