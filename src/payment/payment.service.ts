import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) { }

  /**
   * Initializes a Chapa transaction for an order
   */
  async payForOrder(orderId: string, userId: string, userEmail: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true }
    });

    if (!order) throw new NotFoundException('Order not found');
    
    // Security: Only the owner can pay for the order
    if (order.userId !== userId) {
      throw new UnauthorizedException('You are not authorized to pay for this order');
    }

    if (order.status !== 'pending') {
      throw new BadRequestException(`Order cannot be paid because status is ${order.status}`);
    }

    // Unique transaction reference for Chapa
    const tx_ref = `order-${order.id}-${Date.now()}`;

    // Update the tx_ref in the database
    await this.prisma.order.update({
      where: { id: orderId },
      data: { tx_ref },
    });

    try {
      const response = await axios.post(
        'https://api.chapa.co/v1/transaction/initialize',
        {
          amount: order.total,
          currency: 'ETB',
          email: userEmail,
          tx_ref,
          callback_url: 'http://localhost:3000/payment/verify', // Callback which Chapa pings
          return_url: 'http://localhost:3000/payment/success', // Where user is redirected after payment
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error('Chapa Initialization Error:', error.response?.data || error.message);
      throw new BadRequestException('Failed to initialize payment with Chapa');
    }
  }

  /**
   * Verifies the payment status with Chapa
   */
  async verifyPayment(tx_ref: string) {
    try {
      const response = await axios.get(
        `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          },
        },
      );

      // Chapa status logic
      if (response.data.status === 'success' || response.data.data?.status === 'success') {
        const order = await this.prisma.order.findFirst({
          where: { tx_ref },
        });

        if (order && order.status === 'pending') {
          await this.prisma.order.update({
            where: { id: order.id },
            data: { status: 'paid' },
          });
          return { message: 'Order paid successfully', status: 'paid' };
        } else if (order && order.status === 'paid') {
          return { message: 'Order is already marked as paid', status: 'paid' };
        }
      }

      return { 
        message: 'Payment verification failed or status not success', 
        status: response.data.status 
      };
    } catch (error) {
      console.error('Chapa Verification Error:', error.response?.data || error.message);
      throw new BadRequestException('Payment verification failed');
    }
  }
}

