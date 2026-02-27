/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Transform } from "class-transformer"
import { IsString, IsEmail, IsNotEmpty, MinLength,  Matches } from "class-validator"



export class LoginDto {
    
    @IsString()
    @IsEmail()
    @IsNotEmpty()
    @Transform(({ value }): string => (value as string).trim())
    email:string
    

    
    @IsString()
    @IsNotEmpty()
    @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/, {
        message:
        'Password must contain at least one letter and one number',
    })
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/,
        {
        message:
            'Password must contain uppercase, lowercase, number and special character',
        },
    )
    @MinLength(8)
    password:string
}