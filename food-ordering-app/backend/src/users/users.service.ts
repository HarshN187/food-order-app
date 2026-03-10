import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

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

    // Return a cleaned object that matches the frontend User type
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name, // String, e.g. 'ADMIN'
      countryId: user.countryId,
      country: user.country ? {
        id: user.country.id,
        name: user.country.name,
        code: user.country.code
      } : null,
      createdAt: user.createdAt
    };
  }

  async findAll() {
    const users = await this.userRepository.find({
      relations: ['role', 'country'],
      select: {
        id: true,
        name: true,
        email: true,
        roleId: true,
        countryId: true,
        role: { id: true, name: true },
        country: { id: true, name: true, code: true },
      },
      order: { name: 'ASC' },
    });

    return users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role.name,
      countryId: u.countryId,
      country: u.country ? {
        id: u.country.id,
        name: u.country.name,
        code: u.country.code,
      } : null,
    }));
  }
}
