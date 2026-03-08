import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';
import { COUNTRY_SCOPED_KEY } from '../decorators/country-scoped.decorator';

@Injectable()
export class CountryScopeGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isCountryScoped = this.reflector.getAllAndOverride<boolean>(COUNTRY_SCOPED_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!isCountryScoped) {
      return true; // Skipping if route is not marked as country scoped
    }

    const request = context.switchToHttp().getRequest();
    const { user } = request;

    if (!user) {
      return true; // Relies on JwtAuthGuard to block if unauthenticated
    }

    if (user.role === Role.ADMIN) {
      return true; // Admin has org-wide visibility
    }

    // Inject country filter into query params for service to pick up
    request.query = request.query || {};
    request.query._countryId = user.countryId;

    return true;
  }
}
