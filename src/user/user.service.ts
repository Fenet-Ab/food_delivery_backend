import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { CreateUserDto, LoginUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) { }
   async create(createUserDto: CreateUserDto) {
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('This email is already registered');
    }

    const hashPassword = await bcrypt.hash(createUserDto.password, 10);

    const adminCount = await this.prisma.user.count({
      where: { role: 'admin' }
    });

    const role = adminCount === 0 ? 'admin' : 'user';

    return this.prisma.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashPassword,
        role: role,
      }
    })
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email: email,
      }
    })
  }
  async login(loginUserDto: LoginUserDto) {
    const user = await this.findByEmail(loginUserDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(loginUserDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return user;
  }
  async updateProfile(userId: string, name?: string, email?: string, image?: string) {
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (image) updateData.image = image;

    return this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      },
    });
  }

  async updateRole(userId: string, role: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  }
  async findProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      },
    });
  }
  async deleteProfile(userId: string) {
    return this.prisma.user.delete({
      where: { id: userId },
    });
  }

  async findUsers() {
    return this.prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, image: true },
    });
  }
}
