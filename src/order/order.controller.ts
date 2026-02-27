/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Patch, Param, UseGuards, ParseUUIDPipe, Query, ParseIntPipe } from '@nestjs/common';
import { OrderService } from './order.service';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtGuard } from 'src/user/gurads/JwtGuard';
import { User } from 'src/user/decorators/User';
import * as interfaces from 'utils/interfaces';

@Controller('orders')
@UseGuards(JwtGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post(":cartId")
  public async create(
    @User() user:interfaces.UserPayload,
    @Param("cartId", ParseUUIDPipe) cartId:string

  ) {
    const newOrder = await this.orderService.create(
      user.id,
      cartId
    )
    return newOrder 


  }

  @Get()
  findAll(
    @User() user:interfaces.UserPayload,
    @Query("page",ParseIntPipe) page:number,
    @Query("limit",ParseIntPipe) limit:number,

  ) {
    return this.orderService.findAll(user.id,page,limit);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @User() user:interfaces.UserPayload,
  ) {
    return this.orderService.findOne(id,user.id);
  }

  @Get("cancel/:id")
  public async cancelOrder(
    @Param('id') id: string,
    @User() user:interfaces.UserPayload
  ) {
    const result = await this.orderService.cancelOrder(id,user.id)
    return result
  }
  
  @Get("reorder/:id")
  public async reOrder(
    @Param('id') id: string,
    @User() user:interfaces.UserPayload
  ) {
    const result =await this.orderService.reOrder(id,user.id);
    return result
  }
  @Get("checkout/:id")
  public async checkOut(
    @Param('id') id: string,
    @User() user:interfaces.UserPayload
  ) {
    const result =await this.orderService.reOrder(id,user.id);
    return result
  }

  @Get("sucess-payment/:id")
  public  successPayment(
    @Param('id') id: string,
    @Query("sessionId") sessionId:string
  ) {
    return this.orderService.successPayement(id,sessionId) 

  }

  @Get("for-admin")
  public findAllForAdmin(
    @User() user:interfaces.UserPayload,
    @Query("page",ParseIntPipe) page:number,
    @Query("limit",ParseIntPipe) limit:number,
  ) {
    return this.orderService.findAllOrdersForAdmin(user.id,page,limit)

  }
  @Get("count")
  public ordersCount(
    @User() user:interfaces.UserPayload,

  ) {
    return this.orderService.ordersCount(user.id)

  }
  @Patch(':id')
  public async changeStatus(
    @Param('id') id: string,
    @Body() dto:UpdateOrderDto,
    @User() user:interfaces.UserPayload,

  ) {
    const result = await this.orderService.updateOrderStatusbyAdmin(
      user.id,
      dto,
      id
    )
    return result

  }






}
