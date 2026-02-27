/* eslint-disable prettier/prettier */
import {  BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Order } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
    private stripe: Stripe;
    constructor(
        private readonly config:ConfigService,
        private readonly prisma :PrismaService
    ) {
        this.stripe = new Stripe(
            config.get<string>("SECRET_STRIP_KEY") as string,
        )
    }

    public async createCheckoutSession(order:Order) {

        const session = await this.stripe.checkout.sessions.create(
            {
                mode:"payment",
                payment_method_types:['card'],
                line_items:[
                    {
                        price_data:{
                            currency:"usd",
                            product_data:{
                                name:"order from our website"
                            },
                            unit_amount:Math.round(Number(order.total)*100) 
                        }
                    }
                ],
                success_url: `${process.env.FRONTEND_URL}/success?orderId=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.FRONTEND_URL}/cancel`,
            }
        );
        return session.url
    }

    public async captureSession(sessionId:string) {
        const session = await this.stripe.checkout.sessions.retrieve(sessionId)
        if(session.payment_status !=='paid') {
            throw new BadRequestException('Payment not completed');
        }
        return session
    }


}
