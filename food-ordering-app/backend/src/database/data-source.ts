import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Country } from './entities/country.entity';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';
import { Restaurant } from './entities/restaurant.entity';
import { MenuItem } from './entities/menu-item.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { PaymentMethod } from './entities/payment-method.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  database: process.env.DB_NAME || 'food_ordering',
  synchronize: true, // Auto create schema for simplicity
  logging: false,
  entities: [
    Country,
    Role,
    User,
    Restaurant,
    MenuItem,
    Order,
    OrderItem,
    PaymentMethod,
  ],
  migrations: [],
  subscribers: [],
});
