import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Restaurant } from './restaurant.entity';
import { PaymentMethod } from './payment-method.entity';
import { OrderItem } from './order-item.entity';
import { Country } from './country.entity';
import { OrderStatus } from '../enums/order-status.enum';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', name: 'restaurant_id' })
  restaurantId: string;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.orders)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @Column({ type: 'uuid', name: 'payment_method_id', nullable: true })
  paymentMethodId: string | null;

  @ManyToOne(() => PaymentMethod, { nullable: true })
  @JoinColumn({ name: 'payment_method_id' })
  paymentMethod: PaymentMethod | null;

  @Column({ type: 'varchar', length: 50, default: OrderStatus.DRAFT })
  status: OrderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'total_amount' })
  totalAmount: number;

  @Column({ type: 'uuid', name: 'country_id' })
  countryId: string;

  @ManyToOne(() => Country, (country) => country.orders)
  @JoinColumn({ name: 'country_id' })
  country: Country;

  @Column({ type: 'timestamp', nullable: true, name: 'placed_at' })
  placedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  orderItems: OrderItem[];
}
