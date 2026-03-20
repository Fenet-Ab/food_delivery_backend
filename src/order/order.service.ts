import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) { }
  async createOrder(userId: string, dto: CreateOrderDto) {
    // 🚀 Efficiency: Get all food items in a single query (Bulk Fetch)
    const foodIds = dto.items.map((item) => item.foodId);
    const foods = await this.prisma.food.findMany({
      where: { id: { in: foodIds } },
    });

    // Create a Map for O(1) food lookup by ID
    const foodMap = new Map(foods.map((food) => [food.id, food]));

    let total = 0;
    const orderItems = dto.items.map((item) => {
      const food = foodMap.get(item.foodId);
      if (!food) {
        throw new NotFoundException(`Food with ID ${item.foodId} not found`);
      }

      const itemTotal = food.price * item.quantity;
      total += itemTotal;

      return {
        foodId: food.id,
        name: food.name,
        price: food.price,
        quantity: item.quantity,
        image: food.image, // ✅ Store Cloudinary URL for historical records
      };
    });

    const order = await this.prisma.order.create({
      data: {
        userId,
        total,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
      },
    });

    return order;
  }

  async getUserOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Admin: Get all orders across the system
   */
  async getAllOrders() {
    return this.prisma.order.findMany({
      include: {
        items: true,
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateOrderStatus(id: string, status: string) {
    return this.prisma.order.update({
      where: { id },
      data: { status },
    });
  }
}

