import { Controller, Post, Param, Req, UseGuards, Get } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) { }

  @UseGuards(JwtAuthGuard)
  @Post('pay/:orderId')
  async pay(@Param('orderId') orderId: string, @Req() req) {
    return this.paymentService.payForOrder(orderId, req.user.id, req.user.email);
  }

  @Get('verify/:tx_ref')
  async verify(@Param('tx_ref') tx_ref: string) {
    return this.paymentService.verifyPayment(tx_ref);
  }
}