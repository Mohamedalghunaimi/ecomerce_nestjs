/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsString, MinLength } from "class-validator"

export class CreateProductDto {
    
    @IsString()
    @IsNotEmpty()
    title:string
    
    @IsString()
    @IsNotEmpty()
    slug:string
    
    @IsString()
    @IsNotEmpty()
    @MinLength(10)
    description:string
    
    @IsString()
    @IsNotEmpty()
    categorySlug:string



}
