/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsNumber, IsString, IsUUID, Min,  } from "class-validator"

export class CreateCartDto {
    @IsString()
    @IsNotEmpty()
    @IsUUID()
    variantId: string

    @IsNumber()
    @Min(1)
    quantity: number
}
