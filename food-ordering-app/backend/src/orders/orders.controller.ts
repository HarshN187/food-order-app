import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AddItemDto } from './dto/add-item.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('orders')
@UseGuards(RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER, Role.MEMBER)
  create(@Body() createOrderDto: CreateOrderDto, @Req() req: any) {
    return this.ordersService.create(createOrderDto, req.user);
  }

  @Post(':id/items')
  @Roles(Role.ADMIN, Role.MANAGER, Role.MEMBER)
  addItem(@Param('id') id: string, @Body() addItemDto: AddItemDto, @Req() req: any) {
    return this.ordersService.addItem(id, addItemDto, req.user);
  }

  @Delete(':id/items/:itemId')
  @Roles(Role.ADMIN, Role.MANAGER, Role.MEMBER)
  removeItem(@Param('id') id: string, @Param('itemId') itemId: string, @Req() req: any) {
    return this.ordersService.removeItem(id, itemId, req.user);
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.MEMBER)
  findAll(@Req() req: any) {
    return this.ordersService.findAll(req.user);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.MEMBER)
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.ordersService.findOne(id, req.user);
  }

  @Patch(':id/place')
  @Roles(Role.ADMIN, Role.MANAGER)
  placeOrder(@Param('id') id: string, @Req() req: any) {
    return this.ordersService.placeOrder(id, req.user);
  }

  @Patch(':id/cancel')
  @Roles(Role.ADMIN, Role.MANAGER)
  cancelOrder(@Param('id') id: string, @Req() req: any) {
    return this.ordersService.cancelOrder(id, req.user);
  }
}
