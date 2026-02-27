/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { User } from 'src/user/decorators/User';
import * as interfaces from 'utils/interfaces';
import { JwtGuard } from 'src/user/gurads/JwtGuard';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(JwtGuard)
  public async create(@Body() createProductDto: CreateProductDto,@User() user:interfaces.UserPayload) {
    const newProduct = await this.productService.create(createProductDto,user.id);
    return newProduct;

  }

  @Get("")
  public async findAll(
    @Query("page",ParseIntPipe) page:number,
    @Query("limit",ParseIntPipe) limit:number
  ) {
    const products = await this.productService.findAll(page,limit);
    return products;
  }

  @Get(':id')
  public async findOne(@Param('id') id: string) {
    const product = await this.productService.findOne(id);
    return product
  }

  @Patch(':id')
  @UseGuards(JwtGuard)
  public async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @User() user:interfaces.UserPayload
  ) {
    const updatedProduct = await this.productService.update(id, updateProductDto,user.id);
    return updatedProduct
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  public async remove(
    @Param('id') id: string,
    @User() user:interfaces.UserPayload

  ) {
    const result = await  this.productService.remove(id,user.id);
    return result
  }
}
