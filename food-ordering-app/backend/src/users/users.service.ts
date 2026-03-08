import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role', 'country'],
      select: {
        id: true,
        name: true,
        email: true,
        roleId: true,
        countryId: true,
        createdAt: true,
        role: {
          id: true,
          name: true,
        },
        country: {
          id: true,
          name: true,
          code: true,
        }
      }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
