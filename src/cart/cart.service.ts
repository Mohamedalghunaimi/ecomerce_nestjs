/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UpdateCartDto } from './dto/update-cart.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCartDto } from './dto/create-cart.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma:PrismaService){}
  public async create(userId:string) {
    const user = await this.prisma.user.findUnique({where:{id:userId}})
    if(!user) {
      throw new UnauthorizedException("invalid credentails")
    }
    const newCart = await this.prisma.cart.create({
      data:{
        userId
      }
    })
    return newCart


  }

  public async findAll(userId:string) {
    const user = await this.prisma.user.findUnique({where:{id:userId}})
    if(!user) {
      throw new UnauthorizedException("invalid credentails")
    }
    const carts = await this.prisma.cart.findMany({
      where:{userId},
      include:{
        cartItems:{
          select:{
            quantity:true,
            variant:{
              select:{
                id:true,
                price:true,
                sku:true,
                attributes:true
              }
            }
          }
        }
      }
    })
    return carts
  }

  public async findOne(id:string,userId:string) {
    const user = await this.prisma.user.findUnique({where:{id:userId}})
    if(!user) {
      throw new UnauthorizedException("invalid credentails")
    }
    const cart = await this.prisma.cart.findUnique({
      where:{id},
      include:{
        cartItems:{
          include:{
            variant:{
              select:{
                id:true,
                price:true,
                sku:true,
                attributes:true,
                product:{
                  select:{
                    id:true,
                    title:true
                  }
                }
              }
            }
          }
        }
      }
    })

    const totalPrice = cart?.cartItems.reduce((prev,next)=> {
      return prev + next.quantity* (next.variant as any).price
    },0)
    
    return {
      cart,
      totalPrice
    }



    }





  public async remove(id: string,userId:string) {
    const user = await this.prisma.user.findUnique({where:{id:userId}})
    if(!user) {
      throw new UnauthorizedException("invalid credentails")
    }

    const cart = await this.prisma.cart.findUnique({
      where:{id}
    })
    if(!cart) {
      throw new NotFoundException("cart is not found")
    }
    if(cart.userId !==userId) {
      throw new ForbiddenException("forbidden")
    }
    await this.prisma.cart.delete({
      where:{id}
    })
    return {
      message:"cart is deleted successfully"
    }
  }

  public async addItemToCart(
      userId:string,
      {variantId,quantity }:CreateCartDto,
      cartId:string
    ) {
    const user = await this.prisma.user.findUnique({where:{id:userId}})
    if(!user) {
      throw new UnauthorizedException("invalid credentails")
    }
    const cart = await this.prisma.cart.findUnique({
      where:{id:cartId}
    })
    if(!cart) {
      throw new NotFoundException("cart is not found")
    }
    if(cart.userId !==userId) {
      throw new ForbiddenException("forbidden")
    }
    const variant = await this.prisma.productVariant.findUnique({where:{id:variantId}})
    if(!variant) {
      throw new BadRequestException("product variant is not exist")
    }
    const existingCartItem = await this.prisma.cartItem.findUnique({
      where:{
        cartId_variantId:{
          cartId,
          variantId
        }
      }
    })
    if(existingCartItem) {
      await this.prisma.cartItem.update({
        where:{id:existingCartItem.id},
        data:{
          quantity :{
            increment:quantity
          }
        }
      })
    } else {
    await this.prisma.cartItem.create({
      data:{
        cartId,
        variantId,
        quantity
      }
    })
    }



    return {
      message:"added to cart successfully"
    }

  }
  public async deleteFromCart(
    userId:string,
    itemId:string
  ) {
    const user = await this.prisma.user.findUnique({where:{id:userId}})
    if(!user) {
      throw new UnauthorizedException("invalid credentails")
    }
    const cartItem = await this.prisma.cartItem.findUnique({
      where:{id:itemId},
      select:{
        id:true,
        cart:{
          select:{
            userId:true
          }
        }
      }
    })
    if(!cartItem) {
      throw new BadRequestException("cartitem is not exist")
    }
    if(cartItem.cart.userId !==userId) {
      throw new ForbiddenException("forbidden")
    }

    await this.prisma.cartItem.delete(
      {
        where:{id:cartItem.id}
      }
    )
    return {
      message:"cart item is removed from cart"
    }

  }

  public async updateSingleCartItem(
    userId:string,
    itemId:string,
    {quantity}:UpdateCartDto
  ) {
    const user = await this.prisma.user.findUnique({where:{id:userId}})
    if(!user) {
      throw new UnauthorizedException("invalid credentails")
    }
    const cartItem = await this.prisma.cartItem.findUnique({
      where:{id:itemId},
      select:{
        id:true,
        cart:{
          select:{
            userId:true
          }
        }
      }
    })
    if(!cartItem) {
      throw new BadRequestException("cartitem is not exist")
    }
    if(cartItem.cart.userId !==userId) {
      throw new ForbiddenException("forbidden")
    }

    const updatedCartItem = await this.prisma.cartItem.update(
      {
        where:{id:cartItem.id},
        data:{
          quantity
        }
      }
    )
    return updatedCartItem

  }
}
