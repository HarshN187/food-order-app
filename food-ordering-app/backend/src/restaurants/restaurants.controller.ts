import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { RolesGuard, Roles, Role } from '../common';

@Controller('restaurants')
@UseGuards(RolesGuard)
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.MEMBER)
  findAll(@Req() req: any) {
    return this.restaurantsService.findAll(req.user);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.MEMBER)
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.restaurantsService.findOne(id, req.user);
  }

  @Get(':id/menu')
  @Roles(Role.ADMIN, Role.MANAGER, Role.MEMBER)
  getMenu(@Param('id') id: string, @Req() req: any) {
    return this.restaurantsService.getMenu(id, req.user);
  }
}
