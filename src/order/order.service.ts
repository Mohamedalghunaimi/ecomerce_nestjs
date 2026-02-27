/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { StripeService } from 'src/stripe/stripe.service';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma:PrismaService,
    private readonly stripService:StripeService,
    private readonly mailServce:MailService
  ){}
  public async create(
    userId:string,
    cartId:string

  ) {

    const user = await this.prisma.user.findUnique({where:{id:userId}})
    if(!user) {
      throw new UnauthorizedException("invalid credientails")
    }

    const newOrder = await this.prisma.$transaction(async(tx)=> {
    const cart = await tx.cart.findUnique({
        where:{id:cartId},
        include:{
          cartItems:{
            include:{
              variant:{
                include:{
                  inventories:true
                }
              }
            }
          }
        }
      })

    if(!cart) {
      throw new BadRequestException("cart not found")
    }
    const cartItems = cart.cartItems;
    for(const item of cartItems) {

      const isAvailable = item.quantity <= (item.variant as any).inventories?.quantity;
      if(!isAvailable) {
        throw new BadRequestException("quantity of cartitem is not available")
      }
      
    


      await tx.inventory.update({
        where:{id:item.variant.inventories?.id},
        data:{
          reserved:item.quantity
        }
        
      })
    }
    const total = cartItems.reduce((pre,item)=> {
      return pre + item.quantity*(item.variant as any).price
    },0)
    const newOrder = await tx.order.create({
      data:{
        userId,
        total,
        orderItems:{
          create:cartItems.map((item)=>{
            return {
              price:item.variant.price,
              quantity:item.quantity,
              variantId:item.variantId
            }
          })
          

        },

      }
    })
    return newOrder;
    })
    await this.mailServce.sendNewOrderNotificationToAdmin(user.email,'new order ')

    return newOrder



  }

  public async findAll(
    userId:string,
    page:number=1,
    limit:number=10

  ) {
    const user= await this.prisma.user.findUnique({where:{id:userId},select:{id:true}})
    if(!user) {
      throw new UnauthorizedException("invalid credientails")
    }
    const skip = (page - 1)*limit ;
    
    const orders = await this.prisma.order.findMany({
        where:{userId},
        take:limit,
        skip,
        select:{
          id:true,
          orderItems:{
            select:{
              quantity:true,
              price:true,
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
      }
    )
    return orders
    

  }

  public async findOne(id: string,userId:string) {
    const user= await this.prisma.user.findUnique({where:{id:userId},select:{id:true}})
    if(!user) {
      throw new UnauthorizedException("invalid credientails")
    }
    const order = await this.prisma.order.findFirst(
      {
        where:{id,userId},
        include:{
          orderItems:{
            select:{
              price:true,
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
      },
    )
    if(!order) {
      throw new NotFoundException('order not found')
    }
    return order


  }
  public async cancelOrder(id: string,userId:string) {
    const user = await this.prisma.user.findUnique({where:{id:userId},select:{id:true}})
    if(!user) {
      throw new UnauthorizedException("invalid credientails")
    }
    const order = await this.prisma.order.findFirst({
      where:{id,userId,status:{
      notIn:["CANCELLED","DELIVERED","PAID"]
    }
    },
    select:{
      id:true,
      orderItems:{

        select:{
          quantity:true,
          variant:{
            select:{
              id:true,
              inventories:true
            }
          }
        }
      }
    },

  });
    if(!order) {
      throw new NotFoundException("order not found")
    }
    await this.prisma.order.update(
      {
        where:{id,userId},
        data:{
          status:"CANCELLED",
        }
      }
    )
    const orderItems = order.orderItems;
    for(const item of orderItems) {
      await this.prisma.inventory.update(
        {
          where:{id:item.variant.inventories?.id},
          data:{
            reserved:{
              decrement:item.quantity
            }
          }
        }
      )
    }
    
    return {
      message:"order is cancelled"
    }

  }
  public async reOrder(id: string,userId:string) {
    const user = await this.prisma.user.findUnique({where:{id:userId},select:{id:true}})
    if(!user) {
      throw new UnauthorizedException("invalid credientails")
    }
    const order = await this.prisma.order.findFirst({
      where:{id,userId,status:"CANCELLED"},
      select:{
      id:true,
      orderItems:{
        select:{
          quantity:true,
          variant:{
            select:{
              id:true,
              inventories:true
            }
          }
        }
      }
    },
    })
    if(!order) {
      throw new NotFoundException("order not found")
    }
    await this.prisma.order.update(
      {
        where:{id,userId},
        data:{
          status:"PENDING"
        },

      }
      
    )
    const orderItems = order.orderItems;
    for(const item of orderItems) {
      const inventory = await this.prisma.inventory.findUnique({
        where:{id:item.variant.inventories?.id}
      })
      if(!inventory) {
        throw new BadRequestException("invatory is not exists")
      }
      await this.prisma.inventory.update(
        {
          where:{id:item.variant.inventories?.id},
          data:{
            reserved:{
              increment:item.quantity
            }
          }
        }
      )
    }


    return {
      message:"reorded successfully"
    }
  }

  public async  checkoutWithStrip(orderId: string,userId:string) {
    const user = await this.prisma.user.findUnique({where:{id:userId},select:{id:true}})
    if(!user) {
      throw new UnauthorizedException("invalid credientails")
    }
    const order = await this.prisma.order.findFirst({
      where:{id:orderId,userId},
    })
    if(!order) {
      throw new NotFoundException("order not found")
    }
    const url = await this.stripService.createCheckoutSession(order)
    return {
      url
    }
  }
  public async successPayement(id:string,sessionId:string) {
    await this.stripService.captureSession(sessionId)
    const order = await this.prisma.order.findUnique({
      where:{id},
      select:{
      id:true,
      total:true,
      orderItems:{
        select:{
          quantity:true,
          variant:{
            select:{
              id:true,
              inventories:true
            }
          }
        }
      }
    }
    })
    if(!order) {
      throw new NotFoundException("order not found")
    }
    await this.prisma.order.update(
      {
        where:{id},
        data:{
          status:"PAID",
          payments:{
            create:{
              provider:"stripe",
              status:"SUCCESS",
              amount:order.total
            }
          }
        }
      }
    )
    const orderItems = order.orderItems;
    for(const item of orderItems) {
      await this.prisma.inventory.update(
        {
          where:{id:item.variant.inventories?.id},
          data:{
            reserved:{
              decrement:item.quantity
            },
            quantity:{
              decrement:item.quantity
            }
          }
        }
      )
    }
    
    return {
      message:"success payment"
    }
  }

  public async findAllOrdersForAdmin(
    userId:string,
    page:number=1,
    limit:number=10
  ) {
    const user = await this.prisma.user.findUnique({where:{id:userId},select:{id:true,role:true}})
    if(!user) {
      throw new UnauthorizedException("invalid credientails")
    }
    if(user.role!=="ADMIN") {
      throw new ForbiddenException("forbidden")
    }
    const skip = (page - 1)*limit;
    const orders = await this.prisma.order.findMany({
      skip,
      take:limit,
      orderBy: { createdAt: 'desc' },
      include:{
        user:{
          select:{
            id:true,
            name:true
          },
        },
        payments:{
          select:{
            id:true,
            status:true,
            amount:true,
            provider:true
          }
        },
        orderItems:{
          select:{
            variant:{
              select:{
                product:{
                  select:{
                    title:true,
                    id:true
                  }
                }
              }
            }
          }
        }
      }
    })
    return orders;

  }

  public async ordersCount(
    userId:string
  ) {
    const user = await this.prisma.user.findUnique({where:{id:userId},select:{id:true,role:true}})
    if(!user) {
      throw new UnauthorizedException("invalid credientails")
    }
    if(user.role!=="ADMIN") {
      throw new ForbiddenException("forbidden")
    }
    const productCount = await this.prisma.product.count();
    return productCount

  }

  public async updateOrderStatusbyAdmin(
    userId:string,
    dto:UpdateOrderDto,
    id:string) {
    const user = await this.prisma.user.findUnique({
      where:{id:userId},
      select:{
        id:true,
        role:true
      }
    })
    if(!user) {
      throw new UnauthorizedException("invalid credentails")
    }
    if(user.role!=='ADMIN') {
      throw new ForbiddenException("forbidden")
    }
    await this.prisma.order.update(
      {
        where:{id},
        data:{
          ...dto
        }
      }
    )
    return {
      message:"updated!"
    }


  }




}
