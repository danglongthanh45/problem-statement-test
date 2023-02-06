import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import jwt_decode from "jwt-decode";

const AuthUser = createParamDecorator(
  (
    data: unknown,
    ctx: ExecutionContext,
  ): number => {
    let authentication: string;
    if (ctx.getType() === 'rpc') {
      authentication = ctx.switchToRpc().getData().Authentication;
    } 
    // else if (context.getType() === 'http') {
    //   authentication = context.switchToHttp().getRequest()
    //     .cookies?.Authentication;
    // }
    else if (ctx.getType() === 'http') {
      authentication = ctx.switchToHttp().getRequest()
        .headers?.authorization;
    }
    if (!authentication) {
      throw new UnauthorizedException(
        'No value was provided for Authentication',
      );
    }
    const userParse = jwt_decode(authentication) as any;
    return parseInt(userParse.userId);
  },
);
export default AuthUser;

