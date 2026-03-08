import { Controller, Get, Post, Body, Put, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('payments')
@UseGuards(RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.MEMBER)
  findAll(@Req() req: any) {
    return this.paymentsService.findAllForUser(req.user.id);
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createPaymentDto: CreatePaymentDto, @Req() req: any) {
    return this.paymentsService.create(createPaymentDto, req.user.id);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto, @Req() req: any) {
    return this.paymentsService.update(id, updatePaymentDto, req.user.id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string, @Req() req: any) {
    return this.paymentsService.remove(id, req.user.id);
  }
}
