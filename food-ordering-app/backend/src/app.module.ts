import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth';
import { UsersModule } from './users';
import { RestaurantsModule } from './restaurants';
import { OrdersModule } from './orders';
import { PaymentsModule } from './payments';
import { Country, Role, User, Restaurant, MenuItem, Order, OrderItem, PaymentMethod } from './database';
import { JwtAuthGuard, RolesGuard, CountryScopeGuard } from './common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

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
