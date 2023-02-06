import { Controller, Post, Res, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/current-user.decorator';
import { User } from 'src/db/user.entity';
import { LocalAuthGuard } from 'src/guards/local-auth.guard';
import { AuthService } from './auth.service';
import { Response } from 'express';
import JwtAuthGuard from 'src/guards/jwt-auth.guard';
import { MessagePattern } from '@nestjs/microservices';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    const loginRes = await this.authService.login(user, response);
    response.send({
      user: user,
      token: loginRes
    });
  }

  // @Post('logout')
  // async logout(@Res({ passthrough: true }) response: Response) {
  //   return this.authService.logout(response);
  // }

  @UseGuards(JwtAuthGuard)
  @MessagePattern('validate_user')
  async validateUser(@CurrentUser() user: User) {
    return user;
  }
}
