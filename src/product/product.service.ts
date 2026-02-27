/* eslint-disable prettier/prettier */
import {  BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductService {
  constructor(private readonly prisma:PrismaService){}
  public async create(createProductDto: CreateProductDto,userId:string) {

    const {title,slug,description,categorySlug} = createProductDto;
    const user = await this.prisma.user.findUnique({where:{id:userId},select:{id:true,role:true}})
    if(!user) {
      throw new UnauthorizedException("invalid credientails")
    }
    if(user.role!=='ADMIN') {
      throw new ForbiddenException("forbbiden")
    }
    const existingCategory = await this.prisma.category.findUnique({
      where:{slug:categorySlug},
      select:{id:true}
    });
    if(!existingCategory) {
      throw new BadRequestException("category is not exist")
    }
    const product = await this.prisma.product.findUnique({where:{slug},select:{id:true}});
    if(product) {
      throw new BadRequestException("product slug must be unique")
    }

    const newProduct = await this.prisma.product.create({
      data:{
        title,
        slug,
        description,
        categoryId:existingCategory.id
      }
    })

    return newProduct

  }

  public async findAll(
    page:number=1,
    limit:number=10
  ) {
    const skip = (page - 1) * limit;
    
    const [products,productsCount] = await Promise.all([
      this.prisma.product.findMany({
        skip,
        take:limit,
      select:{
        id:true,
        slug:true,
        description:true,
        createdAt:true,
        
      },
      where:{isActive:true,deletedAt:null},
      orderBy:{createdAt:"desc"}
    }),
      this.prisma.product.count({where:{isActive:true,deletedAt:null}})
    ]);

    return {
      products,
      productsCount
    }

    
  }

  public async findOne(id: string) {
    const product = await this.prisma.product.findUnique(
      {
        where:{id},
        include:{
          category:{
            select:{
              name:true,
              slug:true
            }
          },
          productVariants:{
            include:{
              inventories:{
                select:{
                  quantity:true,
                  reserved:true
                }
              }
            }
          }
        }
      },
    )
    if(!product) {
      throw new BadRequestException("product not found")
    }
    return product;
    

  }

  public async update(id: string, updateProductDto: UpdateProductDto,userId:string) {
    const user = await this.prisma.user.findUnique({where:{id:userId},select:{role:true,id:true}});
    if(!user) {
      throw new UnauthorizedException('user not found')
    }
    if(user.role!=='ADMIN') {
      throw new ForbiddenException("forbidden")
    }
    const product = await this.prisma.product.findUnique({where:{id}});
    if(!product) {
      throw new BadRequestException("product not found")
    }
    const updatedProduct = await this.prisma.product.update(
      {
        where:{
          id
        },
        data:{
          ...updateProductDto
        }
      }
    )
    return updatedProduct
  }

  public async remove(id: string,userId:string) {
    const user = await this.prisma.user.findUnique({where:{id:userId},select:{id:true,role:true}});
    if(!user) {
      throw new UnauthorizedException('user not found')
    }
    if(user.role!=='ADMIN') {
      throw new ForbiddenException("forbidden")
    }
    const product = await this.prisma.product.findUnique({where:{id},select:{id:true}});
    if(!product) {
      throw new BadRequestException("product not found")
    }
    await this.prisma.product.update({
      where:{id,isActive:true,deletedAt:null},
      data:{isActive:false,deletedAt: new Date()}

    })

    return {
      message:"product is deleted successfully"
    }  
  }
  


}
