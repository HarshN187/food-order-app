import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { Country } from './database/entities/country.entity';
import { Role } from './database/entities/role.entity';
import { User } from './database/entities/user.entity';
import { Restaurant } from './database/entities/restaurant.entity';
import { MenuItem } from './database/entities/menu-item.entity';
import { Order } from './database/entities/order.entity';
import { OrderItem } from './database/entities/order-item.entity';
import { PaymentMethod } from './database/entities/payment-method.entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { CountryScopeGuard } from './common/guards/country-scope.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USER', 'postgres'),
        password: configService.get<string>('DB_PASS', 'postgres'),
        database: configService.get<string>('DB_NAME', 'food_ordering'),
        entities: [Country, Role, User, Restaurant, MenuItem, Order, OrderItem, PaymentMethod],
        synchronize: true, // Use only in dev
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    RestaurantsModule,
    OrdersModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // Protect all routes globally by default
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard, // Apply roles check globally
    },
    {
      provide: APP_GUARD,
      useClass: CountryScopeGuard, // Apply country logic globally
    }
  ],
})
export class AppModule {}
