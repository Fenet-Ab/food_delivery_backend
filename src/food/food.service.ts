import { Injectable } from '@nestjs/common';
import { CreateFoodDto } from './dto/create-food.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateFoodDto } from './dto/update-food.dto';

@Injectable()
export class FoodService {
  constructor(private prisma: PrismaService) { }

  async create(createFoodDto: CreateFoodDto) {
    return this.prisma.food.create({
      data: {
        name: createFoodDto.name,
        description: createFoodDto.description,
        price: Number(createFoodDto.price),
        image: createFoodDto.image,
        category: createFoodDto.category || 'other',
      } as any,
    });
  }

  async findAll() {
    return this.prisma.food.findMany();
  }

  async updateFood(id: string, updateFoodDto: any) {
    return this.prisma.food.update({
      where: {
        id: id,
      },
      data: {
        ...(updateFoodDto.name && { name: updateFoodDto.name }),
        ...(updateFoodDto.description && { description: updateFoodDto.description }),
        ...(updateFoodDto.price && { price: Number(updateFoodDto.price) }),
        ...(updateFoodDto.image && { image: updateFoodDto.image }),
        ...(updateFoodDto.category && { category: updateFoodDto.category }),
      } as any,
    });
  }


  async remove(id: string) {
    return this.prisma.food.delete({
      where: { id },
    });
  }
}
