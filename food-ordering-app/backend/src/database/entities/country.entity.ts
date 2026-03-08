import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Restaurant } from './restaurant.entity';
import { Order } from './order.entity';

@Entity('countries')
export class Country {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @Column({ type: 'char', length: 2, unique: true })
  code: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => User, (user) => user.country)
  users: User[];

  @OneToMany(() => Restaurant, (restaurant) => restaurant.country)
  restaurants: Restaurant[];
  
  @OneToMany(() => Order, (order) => order.country)
  orders: Order[];
}
