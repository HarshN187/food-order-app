import { Controller, Get, Post, Body, Put, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, UpdatePaymentDto } from './dto';
import { RolesGuard, Roles, Role } from '../common';

@Controller('payments')
@UseGuards(RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // Admin: get ALL payment methods (across all users)
  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.paymentsService.findAll();
  }

  // Any user: get their own payment methods
  @Get('my')
  @Roles(Role.ADMIN, Role.MANAGER, Role.MEMBER)
  findMine(@Req() req: any) {
    return this.paymentsService.findAllForUser(req.user.id);
  }

  // Admin: create payment method for a specific user (userId in body)
  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  // Admin: update any payment method
  @Put(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentsService.update(id, updatePaymentDto);
  }

  // Admin: delete (soft) any payment method
  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }
}
