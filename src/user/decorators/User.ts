/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";
import { UserPayload } from "utils/interfaces";


export const User = createParamDecorator(
    (data:any,context:ExecutionContext)=> {
        const request :Request =  context.switchToHttp().getRequest() ;
            const user = {
                id:(request.user as any ).id,
                name:(request.user as any ).name
            } as UserPayload
            return user
    }
    
)