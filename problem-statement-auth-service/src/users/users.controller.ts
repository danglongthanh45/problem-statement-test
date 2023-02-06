import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { CreateUserRequest } from './dto/create-user.request';
import { UsersService } from './users.service';

@Controller('auth/users')
export class UsersController {
    constructor(private readonly userService: UsersService) {}

    @Post()
    async createUser(@Body() request: CreateUserRequest) {
      return this.userService.create(request);
    }
}