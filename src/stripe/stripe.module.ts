/* eslint-disable prettier/prettier */
import { Global, Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
@Global()
@Module({
  providers: [StripeService]
})
export class StripeModule {}
