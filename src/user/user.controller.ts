/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dtos/create_user.dto';
import { LocalGuard } from './gurads/localGurad';
import type { Request, Response } from 'express';
import { GoogleGuard } from './gurads/GoogleGurad';
import { ConfigService } from '@nestjs/config';
import clients from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly config:ConfigService
  ) {}

  @Post("auth/register")
  public async register(
    @Body() dto:CreateUserDto
  ) {
    const result = await this.userService.createUser(dto);
    return result ;

  }

  @Post('auth/login')
  @UseGuards(LocalGuard)
  public async login(
    @Req() req:Request,
    @Res({ passthrough: true }) res:Response   

  ) {
    const user :clients.User = req.user as clients.User ;




    const accessToken = await this.userService.signIn(user)
    res.cookie("accessToken",accessToken,{
      httpOnly:true,
      sameSite:"lax",
      secure:process.env.NODE_ENV==='production',
      path:"/",
      maxAge: 1000 * 60 * 60 * 24, // يوم
    })

    return {
      message:"logged in successfully"
    }    
    


  }

  @Get("auth/google")
  @UseGuards(GoogleGuard)
  public loginWithGoogle() {

  }

  @Get("auth/google/callback")
  @UseGuards(GoogleGuard)
  public async  googleAuthRedirect(@Req() req:Request,@Res() res:Response) {
    const user = req.user as clients.User ;

    const accessToken = await this.userService.signIn(user);
    res.cookie(
      'accessToken',
      accessToken,
      {
          httpOnly: true,
          secure: process.env.NODE_ENV ==='production',
          sameSite: 'lax',
          maxAge: 1000 * 60 * 60 * 24, 
          path: '/',
      }
      
    )
    return res.redirect(this.config.get<string>("CLIENT_URL") as string)
  

  }


}
