/* eslint-disable prettier/prettier */
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtGuard } from 'src/user/gurads/JwtGuard';
import { User } from 'src/user/decorators/User';
import * as interfaces from 'utils/interfaces';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(JwtGuard)
  public async create(@Body() createCategoryDto: CreateCategoryDto,@User() user:interfaces.UserPayload) {

    const newCategory = await this.categoryService.create(createCategoryDto,user.id);
    return newCategory


    
  }


}
