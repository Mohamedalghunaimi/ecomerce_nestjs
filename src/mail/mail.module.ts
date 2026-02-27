/* eslint-disable prettier/prettier */
import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
@Global()
@Module({
  providers: [MailService],
  exports:[MailService],
  imports:[
    MailerModule.forRootAsync({
      inject:[ConfigService],
      useFactory:(config:ConfigService) => {
        return {
          transport:{
            host:config.get<string>("MAIL_HOST"),
            port:config.get<number>("MAIL_PORT"),
            secure:true,
            auth:{
              user:config.get<string>("MAIL_USER"),
              pass:config.get<string>("MAIL_PASSWORD")
            }
          },
          defaults:{
            from: `"my-app" <${config.get<string>("mail_from")}>`
          }
        }
        

      }
    })
  ]
})
export class MailModule {}
