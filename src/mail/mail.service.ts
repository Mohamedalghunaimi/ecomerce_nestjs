/* eslint-disable prettier/prettier */
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class MailService {
    constructor(private readonly mailerService:MailerService){}

    public async sendNewOrderNotificationToAdmin(email:string,subject:string) {
        try {
            await this.mailerService.sendMail({
                to:process.env.ADMIN_EMAIL,
                subject,
                html:`
                <div>
                <h1>new order </h1>
                <ul>
                    <li>user email:${email}</li>
                </ul>
                <p>please check your control panel</p>
                </div>
                `
            })
        } catch (error) {
            console.error(error)
            throw new InternalServerErrorException()
        }
    }

    public async sendVerificationToEmail(email:string,link:string) {
        try {
            await this.mailerService.sendMail({
                to:process.env.ADMIN_EMAIL,
                subject:"verification to email",
                html:`
                <div>
                <h1>verify email</h1>
                <p>please click here to verify your email</p>
                <a href="${link}">
                verify
                </a>
                </div>
                `
            })
        } catch (error) {
            console.error(error)
            throw new InternalServerErrorException()
        }
    }




}
