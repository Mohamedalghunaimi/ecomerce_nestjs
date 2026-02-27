/* eslint-disable prettier/prettier */
import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductVariantService {
  constructor(private readonly prisma:PrismaService){}
  public async create(createProductVariantDto: CreateProductVariantDto,productId:string,userId:string) {
    const user = await this.prisma.user.findUnique({where:{id:userId}});
    if(!user) {
      throw new UnauthorizedException("invalid credentails")
    }
    if(user.role==='USER') {
      throw new ForbiddenException("forbidden")
    }
    const product = await this.prisma.product.findFirst({where:{id:productId,isActive:true,deletedAt:null}})
    if(!product) {
      throw new NotFoundException("prdoduct not found")
    }
    const {attributes,price,sku,quantity,reserved} = createProductVariantDto;
    const productVariant = await this.prisma.productVariant.findUnique({where:{sku}});
    if(productVariant) {
      throw new BadRequestException("sku must be unique")
    }
    const newProductVariant = await this.prisma.productVariant.create({
      data:{
        attributes,
        sku,
        price,
        productId,
        inventories:{
          create:{
            quantity,
            reserved
          }
        }
        

      }
    })

    return newProductVariant


    

  }

  public async findAll(productId:string) {
    const product = await this.prisma.product.findFirst({where:{id:productId,isActive:true,deletedAt:null}});
    if(!product) {
      throw new NotFoundException("product not found")
    }
    const productVariants = await this.prisma.productVariant.findMany({
      where:{productId}
    })
    return productVariants
  }



  public async update(id: string, updateProductVariantDto: UpdateProductVariantDto,userId:string) {

    const user = await this.prisma.user.findUnique({where:{id:userId}});
    if(!user) {
      throw new UnauthorizedException("invalid credentails")
    }
    if(user.role!=="ADMIN") {
      throw new ForbiddenException("forbidden")
    }
    const productVariant = await this.prisma.productVariant.findUnique({where:{id}})
    if(!productVariant) {
      throw new NotFoundException("ProductVariant not found")
    }
    const {sku,attributes,price,quantity,reserved} = updateProductVariantDto ;
    if(sku) {
      const existingProductVariantWithSku = await this.prisma.productVariant.findUnique({where:{sku}})
      if(existingProductVariantWithSku) {
        throw new BadRequestException("sku must be unigue")
      }

    }
    const updatedProductVariant = await this.prisma.productVariant.update({
      where:{id},
      data:{
        sku,
        attributes,
        price,
        inventories:{
          update:{
            quantity,
            reserved

          }
        }
      }
    })
    return updatedProductVariant


  }

  public async remove(id: string,userId:string) {

    const user = await this.prisma.user.findUnique({where:{id:userId}});
    if(!user) {
      throw new UnauthorizedException("invalid credentails")
    }
    if(user.role!=="ADMIN") {
      throw new ForbiddenException("forbidden")
    }
    const productVariant = await this.prisma.productVariant.findUnique(
      {
        where:{id},
        select:{
          inventories:{
            select:{
              quantity:true,
              reserved:true
            }
          }
        }
      }
    )
      if(!productVariant) {
      throw new NotFoundException("ProductVariant not found")
    }
    const productInventory = productVariant?.inventories;
    if(!productInventory) {
      throw new UnprocessableEntityException()
    }
    if(productInventory.reserved>0 || productInventory.quantity>0) {
      throw new BadRequestException("product is available in our store")
    }

    await this.prisma.productVariant.delete({
      where:{id}
    })
    return {
      message:"Product variant is deleted successfully!"

    }
  }
}
