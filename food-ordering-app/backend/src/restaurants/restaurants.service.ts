import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from '../database/entities/restaurant.entity';
import { MenuItem } from '../database/entities/menu-item.entity';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
    @InjectRepository(MenuItem)
    private readonly menuItemRepo: Repository<MenuItem>,
  ) {}

  async findAll(user: any) {
    const where: any = { isActive: true };
    if (user.role !== Role.ADMIN) {
      where.countryId = user.countryId;
    }
    return this.restaurantRepo.find({ where, relations: ['country'] });
  }

  async findOne(id: string, user: any) {
    const restaurant = await this.restaurantRepo.findOne({
      where: { id, isActive: true },
      relations: ['country'],
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    if (user.role !== Role.ADMIN && restaurant.countryId !== user.countryId) {
      throw new NotFoundException('Restaurant not found');
    }

    return restaurant;
  }

  async getMenu(id: string, user: any) {
    // Validate access to the restaurant first
    await this.findOne(id, user);

    return this.menuItemRepo.find({
      where: { restaurantId: id, isAvailable: true },
    });
  }
}
