/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { UpdateCartDto } from './dto/update-cart.dto';
import { JwtGuard } from 'src/user/gurads/JwtGuard';
import { User } from 'src/user/decorators/User';
import * as interfaces from 'utils/interfaces';
import { CreateCartDto } from './dto/create-cart.dto';

@Controller('carts')
@UseGuards(JwtGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  public async create(
    @User() user:interfaces.UserPayload
  ) {
    const newCart= await this.cartService.create(user.id);
    return newCart
  }

  @Get()
  findAll(
    @User() user:interfaces.UserPayload

  ) {
    return this.cartService.findAll(user.id);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @User() user:interfaces.UserPayload

  ) {
    return this.cartService.findOne(id,user.id);
  }



  @Delete(':id')
  remove(
    @Param('id') id: string,
    @User() user:interfaces.UserPayload

  ) {
    return this.cartService.remove(id,user.id);
  }
  @Post(':id')
  public async addToCart(
    @Param('id') id: string,
    @User() user:interfaces.UserPayload,
    @Body() dto:CreateCartDto

  ) {
    const result = await this.cartService.addItemToCart(user.id,dto,id)
    return result

  }

  @Delete("cart/:itemId")
  public async removeFromCart(
    @User() user:interfaces.UserPayload,
    @Param('itemId') itemId: string,

  ) {

    const result = await this.cartService.deleteFromCart(user.id,itemId);
    return result


  }
  
  @Patch("cart/:itemId")
  public async updateCartItem(
    @User() user:interfaces.UserPayload,
    @Param('itemId') itemId: string,
    dto:UpdateCartDto
  ) {
    const updatedCartItem = await this.cartService.updateSingleCartItem(user.id,itemId,dto)
    return updatedCartItem


  }






}
