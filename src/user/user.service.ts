import { Injectable } from '@nestjs/common';
import { CreateUserDto, LoginUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) { }
  async create(createUserDto: CreateUserDto) {
    const hashPassword = await bcrypt.hash(createUserDto.password, 10);

    // Check if any admin exists in the database
    const adminCount = await this.prisma.user.count({
      where: { role: 'admin' }
    });

    // If no admin exists, the next user to register becomes the first admin
    const role = adminCount === 0 ? 'admin' : 'user';

    console.log(`Admin count found: ${adminCount}`);
    console.log(`Assigning role: ${role}`);


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
    const user = await this.prisma.user.findUnique({
      where: {
        email: loginUserDto.email,
      }
    });

    if (!user) {
      throw new Error("Invalid email");
    }

    const isPasswordValid = await bcrypt.compare(loginUserDto.password, user.password);

    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }

    return user;
  }
  async updateProfile(userId: string, name?: string, email?: string, image?: string) {
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (image) updateData.image = image;

    console.log(`Applying update for user ${userId}:`, updateData);

    return this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        name: true,
        email: true,
        image: true,
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
        name: true,
        email: true,
        image: true,
      },
    });
  }
  async deleteProfile(userId: string) {
    return this.prisma.user.delete({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,

      },
      // message: "profile deleted successfully"
    })

  }
}
