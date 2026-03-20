import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  /**
   * User: Create a new order
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return this.orderService.createOrder(req.user.id, createOrderDto);
  }

  /**
   * User: Get personal order history
   */
  @UseGuards(JwtAuthGuard)
  @Get('my-orders')
  getUserOrders(@Request() req) {
    return this.orderService.getUserOrders(req.user.id);
  }

  /**
   * Admin: View all orders across the platform
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('all')
  getAllOrders() {
    return this.orderService.getAllOrders();
  }
}
