/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ProductModule } from './product/product.module';
import { CategoryModule } from './category/category.module';
import { ProductVariantModule } from './product-variant/product-variant.module';
import { CartModule } from './cart/cart.module';
import { MailModule } from './mail/mail.module';
import { StripeModule } from './stripe/stripe.module';
import { OrderModule } from './order/order.module';


@Module({
  imports: [
    UserModule,
    ConfigModule.forRoot({
      isGlobal:true,
      envFilePath:".env"
    }),
    PrismaModule,
    JwtModule.registerAsync({
      inject:[ConfigService],
      global:true,
      useFactory:(config:ConfigService) => {
        return {
          secret:config.get<string>("JWT_SECRET"),
          signOptions:{
            expiresIn:"1d"
          }
        }
      }
    }),
    ProductModule,
    CategoryModule,
    ProductVariantModule,
    CartModule,
    OrderModule,
    StripeModule,
    MailModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
