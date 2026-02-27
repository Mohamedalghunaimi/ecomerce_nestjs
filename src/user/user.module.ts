/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { LocalStrategy } from './strategies/loacl.str';
import { JwtStrategy } from './strategies/jwt.str';
import { GoogleStrategy } from './strategies/google.str';

@Module({
  controllers: [UserController],
  providers: [UserService,LocalStrategy,JwtStrategy,GoogleStrategy],
})
export class UserModule {}
