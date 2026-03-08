import { DataSource } from 'typeorm';
import { AppDataSource } from '../data-source';
import * as bcrypt from 'bcrypt';
import { Country } from '../entities/country.entity';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import { Restaurant } from '../entities/restaurant.entity';
import { MenuItem } from '../entities/menu-item.entity';
import { PaymentMethod } from '../entities/payment-method.entity';
import { RoleType } from '../enums/role-type.enum';

async function seed() {
  const dataSource = await AppDataSource.initialize();
  console.log('Database connected');

  // Clear tables
  await dataSource.query(`TRUNCATE TABLE payment_methods, order_items, orders, menu_items, restaurants, users, roles, countries CASCADE;`);

  // Seed Countries
  const countryRepo = dataSource.getRepository(Country);
  const india = await countryRepo.save(countryRepo.create({ name: 'India', code: 'IN' }));
  const america = await countryRepo.save(countryRepo.create({ name: 'America', code: 'US' }));
  console.log('Countries seeded');

  // Seed Roles
  const roleRepo = dataSource.getRepository(Role);
  const adminRole = await roleRepo.save(roleRepo.create({ name: RoleType.ADMIN }));
  const managerRole = await roleRepo.save(roleRepo.create({ name: RoleType.MANAGER }));
  const memberRole = await roleRepo.save(roleRepo.create({ name: RoleType.MEMBER }));
  console.log('Roles seeded');

  // Seed Users
  const userRepo = dataSource.getRepository(User);
  const adminPass = await bcrypt.hash('admin123', 10);
  const managerPass = await bcrypt.hash('manager123', 10);
  const memberPass = await bcrypt.hash('member123', 10);

  const nickFury = await userRepo.save(userRepo.create({
    name: 'Nick Fury', email: 'nick@shield.com', passwordHash: adminPass, roleId: adminRole.id, countryId: null
  }));
  const captMarvel = await userRepo.save(userRepo.create({
    name: 'Captain Marvel', email: 'marvel@shield.com', passwordHash: managerPass, roleId: managerRole.id, countryId: india.id
  }));
  const captAmerica = await userRepo.save(userRepo.create({
    name: 'Captain America', email: 'america@shield.com', passwordHash: managerPass, roleId: managerRole.id, countryId: america.id
  }));
  const thanos = await userRepo.save(userRepo.create({
    name: 'Thanos', email: 'thanos@shield.com', passwordHash: memberPass, roleId: memberRole.id, countryId: india.id
  }));
  const thor = await userRepo.save(userRepo.create({
    name: 'Thor', email: 'thor@shield.com', passwordHash: memberPass, roleId: memberRole.id, countryId: india.id
  }));
  const travis = await userRepo.save(userRepo.create({
    name: 'Travis', email: 'travis@shield.com', passwordHash: memberPass, roleId: memberRole.id, countryId: america.id
  }));
  console.log('Users seeded');

  // Seed Restaurants
  const restaurantRepo = dataSource.getRepository(Restaurant);
  const r1 = await restaurantRepo.save(restaurantRepo.create({ name: 'Spice Garden', cuisineType: 'Indian', countryId: india.id, address: 'Mumbai' }));
  const r2 = await restaurantRepo.save(restaurantRepo.create({ name: 'Mumbai Bites', cuisineType: 'Street Food', countryId: india.id, address: 'Delhi' }));
  const r3 = await restaurantRepo.save(restaurantRepo.create({ name: 'The Burger Joint', cuisineType: 'American', countryId: america.id, address: 'New York' }));
  const r4 = await restaurantRepo.save(restaurantRepo.create({ name: 'NY Pizza Co.', cuisineType: 'Italian-American', countryId: america.id, address: 'Brooklyn' }));
  console.log('Restaurants seeded');

  // Seed Menu Items
  const menuItemRepo = dataSource.getRepository(MenuItem);
  
  // R1 items
  for(let i=1; i<=5; i++) {
    await menuItemRepo.save(menuItemRepo.create({ restaurantId: r1.id, name: `Spice Dish ${i}`, price: 100 + i*50 }));
  }
  // R2 items
  for(let i=1; i<=5; i++) {
    await menuItemRepo.save(menuItemRepo.create({ restaurantId: r2.id, name: `Street Food ${i}`, price: 50 + i*20 }));
  }
  // R3 items
  for(let i=1; i<=5; i++) {
    await menuItemRepo.save(menuItemRepo.create({ restaurantId: r3.id, name: `Burger Item ${i}`, price: 10 + i*2 }));
  }
  // R4 items
  for(let i=1; i<=5; i++) {
    await menuItemRepo.save(menuItemRepo.create({ restaurantId: r4.id, name: `Pizza Slice ${i}`, price: 5 + i*2 }));
  }
  console.log('Menu Items seeded');

  // Seed Payment Methods
  const paymentRepo = dataSource.getRepository(PaymentMethod);
  await paymentRepo.save([
    paymentRepo.create({ userId: nickFury.id, type: 'CARD', provider: 'Visa', lastFour: '4242', isDefault: true }),
    paymentRepo.create({ userId: captMarvel.id, type: 'UPI', provider: 'Google Pay', lastFour: null, isDefault: true }),
    paymentRepo.create({ userId: captAmerica.id, type: 'CARD', provider: 'Mastercard', lastFour: '1234', isDefault: true }),
    paymentRepo.create({ userId: thanos.id, type: 'CARD', provider: 'Visa', lastFour: '0000', isDefault: true }),
    paymentRepo.create({ userId: thor.id, type: 'WALLET', provider: 'PayPal', lastFour: null, isDefault: true }),
    paymentRepo.create({ userId: travis.id, type: 'CARD', provider: 'Amex', lastFour: '8888', isDefault: true }),
  ]);
  console.log('Payment Methods seeded');

  await dataSource.destroy();
  console.log('Seeding complete & connection closed');
}

seed().catch(console.error);
