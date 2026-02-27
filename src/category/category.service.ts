/* eslint-disable prettier/prettier */
import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma:PrismaService){}
  public async create(createCategoryDto: CreateCategoryDto,userId:string) {
    const {name,slug} = createCategoryDto;
    const existingCategory = await this.prisma.category.findUnique({
      where:{slug}
    })
    if(existingCategory){ throw new BadRequestException("category is already existing")}
    const user = await this.prisma.user.findUnique({where:{id:userId}});
    if(!user) {
      throw new UnauthorizedException("invalid credientails")
    }
    if(user.role!=='ADMIN') {
      throw new ForbiddenException("forbidden action")
    }
    const newCategory = await this.prisma.category.create({
      data:{
        name,
        slug
      }
    })
    return newCategory
    

  
  }


}
