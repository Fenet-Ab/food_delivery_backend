import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { FoodModule } from './food/food.module';
import { OrderModule } from './order/order.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [UserModule, PrismaModule, AuthModule, FoodModule, OrderModule, PaymentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
