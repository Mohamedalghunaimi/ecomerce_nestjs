/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dtos/create_user.dto';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dtos/login.dto';
import { UserPayload } from 'utils/interfaces';
import { JwtService } from '@nestjs/jwt';
import strict from 'assert/strict';
import { MailService } from 'src/mail/mail.service';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
    constructor(
        private readonly prisma:PrismaService,
        private readonly jwt:JwtService,
        private readonly mailService:MailService

        
    ){}

    public async createUser(dto:CreateUserDto) {
        const {email,name,password} = dto ;
        const existingUser = await this.prisma.user.findUnique({
            where:{email}
        });
        if (existingUser) {
            throw new BadRequestException("account is already exist")
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);
        const verifyToken = await this.jwt.signAsync({
            email,
            type: 'email_verification',
        },{
            expiresIn:"15m"
        })
        const domain = process.env.domain 
        const link = `${domain}/verify?token=${verifyToken}`
        await this.mailService.sendVerificationToEmail(email,link)
        await this.prisma.user.create({
            data:{
                name,
                password:hashedPassword,
                email,
                verifyToken
            }
        })
        return {
            message:"account is created successfully!"
        }
    }
    public async checkVericicationToEmail(token:string) {
        if(!token) {
            throw new BadRequestException("token must be provided")
        }
        try {
            const {email}:{email:string} = await this.jwt.verifyAsync(token);
            if(!email)  {
                throw new InternalServerErrorException()
            }
            const user = await this.prisma.user.findUnique({where:{email}});
            if(!user) {
                throw new UnauthorizedException("invalid credentails")
            }
            if(user.isverified) {
                return {
                    message:"user is already verified"
                }
            }
            
            await this.prisma.user.update({
                where:{
                    id:user.id
                },
                data:{
                    isverified:true,
                    verifyToken:null
                }
            })
            return {
                message:"email is verified"
            }

        } catch (error) {
            console.error(error)
            throw new UnauthorizedException("invalid token")
        }

    }
    public async validateUser({email,password}:LoginDto) {
        const user = await this.prisma.user.findUnique({where:{email}})
        if(!user) {
            throw new UnauthorizedException("invalid inputs")
        }
        const isMatch = await bcrypt.compare(password,user.password as string);
        if(!isMatch) {
            throw new UnauthorizedException("invalid inputs")
        }
        const {password: _, ...result} = user ;
        return result
    }

    public async signIn(user:User) {
        if(!user.isverified) {
                const verifyToken = await this.jwt.signAsync({email:user.email,type: 'email_verification',},{expiresIn:"15m"})
                const domain = process.env.domain;
                const link = `${domain}/verify?token=${verifyToken}`
                await this.mailService.sendVerificationToEmail(user.email,link)
                await this.prisma.user.update({
                    where:{email:user.email},
                    data:{
                        verifyToken
                    }
                })
            
            throw new UnauthorizedException("please check your email")

        }
        const payload:UserPayload = {
            id:(user ).id,
            name:(user ).name
        }
        const accessToken = await this.jwt.signAsync(payload);
        return accessToken


    }

    public async validateUserFromGoogle({name,email}:{name:string,email:string})
    {
        const user = await this.prisma.user.findUnique({where:{email}})
        if(!user) {
            const newUser = await this.prisma.user.create({
                data:{
                    email,
                    name
                }
            })
            return newUser
        }
        return user
    }

    


}
