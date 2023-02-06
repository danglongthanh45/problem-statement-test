import { Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/db/user.entity';
import { Repository } from 'typeorm';
import { CreateUserRequest } from './dto/create-user.request';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {
  }

  async create(userRequest: CreateUserRequest): Promise<User> {
    await this.validateCreateUserRequest(userRequest);
    const user = new User();    
    user.username = userRequest.username;
    user.password = await bcrypt.hash(userRequest.password, 10)
    return await this.userRepo.save(user);
  }

  private async validateCreateUserRequest(request: CreateUserRequest) {
    let userValidate: User;
    try {
        userValidate = await this.userRepo.findOneBy({
            username: request.username,
        });
    } catch (err) {}

    if (userValidate) {
      throw new UnprocessableEntityException('User already exists.');
    }
  }

  async validateUser(username: string, password: string) {
    const user = await this.userRepo.findOneBy({ username });
    if(!user) {
      throw new UnauthorizedException('Credentials are not valid.');
    } else {
      const passwordIsValid = await bcrypt.compare(password, user.password);
      if (!passwordIsValid) {
        throw new UnauthorizedException('Credentials are not valid.');
      }
    }    
    return user;
  }

  async getUser(getUserArgs: Partial<User>) {
    return this.userRepo.findOneBy({ id: getUserArgs.id });
  }
}



