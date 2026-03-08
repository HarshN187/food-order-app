import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Country } from './country.entity';
import { MenuItem } from './menu-item.entity';
import { Order } from './order.entity';

@Entity('restaurants')
export class Restaurant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 100, name: 'cuisine_type', nullable: true })
  cuisineType: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'uuid', name: 'country_id' })
  countryId: string;

  @ManyToOne(() => Country, (country) => country.restaurants)
  @JoinColumn({ name: 'country_id' })
  country: Country;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @OneToMany(() => MenuItem, (menuItem) => menuItem.restaurant)
  menuItems: MenuItem[];

  @OneToMany(() => Order, (order) => order.restaurant)
  orders: Order[];
}
