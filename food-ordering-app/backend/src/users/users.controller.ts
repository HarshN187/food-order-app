import { Controller, Get, Req } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getProfile(@Req() req: any) {
    // The JwtAuthGuard attaches the decoded JWT payload to req.user
    return this.usersService.getProfile(req.user.id);
  }
}
