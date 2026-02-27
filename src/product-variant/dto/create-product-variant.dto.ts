/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsNumber, IsObject, IsString, Max, Min } from "class-validator";

export class CreateProductVariantDto {
    @IsNumber()
    @Min(50)
    @Max(1000)
    price:number
    

    @IsNotEmpty()
    @IsString()
    sku:string


    @IsObject()
    attributes: Record<string,string>
    
    @IsNumber()
    @Min(0)
    quantity:number

    
    @IsNumber()
    @Min(0)
    reserved:number


}
