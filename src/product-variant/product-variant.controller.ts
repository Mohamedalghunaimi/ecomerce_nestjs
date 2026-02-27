/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ProductVariantService } from './product-variant.service';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { JwtGuard } from 'src/user/gurads/JwtGuard';
import { User } from 'src/user/decorators/User';
import * as interfaces from 'utils/interfaces';

@Controller('product-variant')
export class ProductVariantController {
  constructor(private readonly productVariantService: ProductVariantService) {}

  @Post(':productId')
  @UseGuards(JwtGuard)
  public async create(
    @Body() createProductVariantDto: CreateProductVariantDto,
    @Param("productId") productId:string,
    @User() user:interfaces.UserPayload
  ) {
    const newProductVariant = await this.productVariantService.create(createProductVariantDto,productId,user.id);
    return newProductVariant
  }

  @Get(":productId")
  public async findAll(
    @Param("productId") productId:string
  ) {
    const productVariants= await this.productVariantService.findAll(productId);
    return productVariants
  }


  @Patch(':id')
  @UseGuards(JwtGuard)
  public async update(
    @Param('id') id: string,
    @Body() updateProductVariantDto: UpdateProductVariantDto,
    @User() user:interfaces.UserPayload
  ) {
    const updatedProductVariant = await  this.productVariantService.update(id, updateProductVariantDto,user.id);
    return updatedProductVariant
  }

  @Delete(':id')
  public async remove(
    @Param('id') id: string,
    @User() user:interfaces.UserPayload
  ) {
    const result = await this.productVariantService.remove(id,user.id);
    return result
  }
}
