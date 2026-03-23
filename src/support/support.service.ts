import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSupportDto, ReplySupportDto } from './dto/create-support.dto';

@Injectable()
export class SupportService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateSupportDto) {
    return this.prisma.supportMessage.create({
      data: {
        userId,
        subject: dto.subject,
        message: dto.message,
      },
    });
  }

  async findUserMessages(userId: string) {
    return this.prisma.supportMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll() {
    return this.prisma.supportMessage.findMany({
      include: {
        user: {
          select: { name: true, email: true, image: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async reply(id: string, dto: ReplySupportDto) {
    const msg = await this.prisma.supportMessage.findUnique({ where: { id } });
    if (!msg) throw new NotFoundException('Message not found');

    return this.prisma.supportMessage.update({
      where: { id },
      data: {
        reply: dto.reply,
        status: 'replied',
      },
    });
  }
}
