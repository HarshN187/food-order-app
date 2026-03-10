import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderItem, Restaurant, MenuItem } from '../database';
import { Role } from '../common';
import { OrderStatus } from '../database/enums';
import { CreateOrderDto, AddItemDto } from './dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
    @InjectRepository(MenuItem)
    private readonly menuItemRepo: Repository<MenuItem>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createOrderDto: CreateOrderDto, user: any) {
    const restaurant = await this.restaurantRepo.findOne({ where: { id: createOrderDto.restaurantId } });
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    // Role check: non-admin must order from their own country
    if (user.role !== Role.ADMIN && restaurant.countryId !== user.countryId) {
      throw new ForbiddenException('Cannot order from a restaurant outside your country');
    }

    const order = this.orderRepo.create({
      userId: user.id,
      restaurantId: restaurant.id,
      countryId: restaurant.countryId, // order inherits restaurant's country
      paymentMethodId: createOrderDto.paymentMethodId || null,
      status: OrderStatus.DRAFT,
      totalAmount: 0,
    });

    return this.orderRepo.save(order);
  }

  async addItem(orderId: string, addItemDto: AddItemDto, user: any) {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    
    // Authorization check
    if (user.role !== Role.ADMIN && order.countryId !== user.countryId) {
      throw new ForbiddenException('You cannot access this order');
    }
    
    if (user.role === Role.MEMBER && order.userId !== user.id) {
       throw new ForbiddenException('You can only modify your own orders');
    }

    if (order.status !== OrderStatus.DRAFT) {
      throw new BadRequestException('Can only add items to DRAFT orders');
    }

    const menuItem = await this.menuItemRepo.findOne({ where: { id: addItemDto.menuItemId } });
    if (!menuItem) throw new NotFoundException('Menu item not found');
    if (menuItem.restaurantId !== order.restaurantId) {
       throw new BadRequestException("Menu item does not belong to the order's restaurant");
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const orderItem = queryRunner.manager.create(OrderItem, {
        orderId: order.id,
        menuItemId: menuItem.id,
        quantity: addItemDto.quantity,
        unitPrice: menuItem.price,
      });

      await queryRunner.manager.save(orderItem);

      // Recalculate total
      order.totalAmount = Number(order.totalAmount) + (Number(menuItem.price) * addItemDto.quantity);
      await queryRunner.manager.save(order);

      await queryRunner.commitTransaction();
      
      // Return orderItem with menuItem relation for response
      return await this.orderItemRepo.findOne({
        where: { id: orderItem.id },
        relations: ['menuItem']
      });
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Failed to add item to order');
    } finally {
      await queryRunner.release();
    }
  }

  async removeItem(orderId: string, itemId: string, user: any) {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    if (user.role !== Role.ADMIN && order.countryId !== user.countryId) {
      throw new ForbiddenException('You cannot access this order');
    }
    if (user.role === Role.MEMBER && order.userId !== user.id) {
       throw new ForbiddenException('You can only modify your own orders');
    }

    if (order.status !== OrderStatus.DRAFT) {
      throw new BadRequestException('Can only remove items from DRAFT orders');
    }

    const orderItem = await this.orderItemRepo.findOne({ where: { id: itemId, orderId: orderId } });
    if (!orderItem) {
      throw new NotFoundException('Order item not found in this order');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.remove(orderItem);

      // Recalculate total
      order.totalAmount = Number(order.totalAmount) - (Number(orderItem.unitPrice) * orderItem.quantity);
      // Ensure it doesn't go below 0 due to float math
      if (order.totalAmount < 0) order.totalAmount = 0;
      await queryRunner.manager.save(order);

      await queryRunner.commitTransaction();
      return { success: true, message: 'Item removed successfully' };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Failed to remove item');
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(user: any) {
    const where: any = {};
    
    if (user.role === Role.ADMIN) {
      // Admin sees everything
    } else {
      // MANAGER and MEMBER see all orders in their country as per Prompt 3
      where.countryId = user.countryId;
    }

    return this.orderRepo.find({
      where,
      relations: ['orderItems', 'orderItems.menuItem', 'restaurant'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string, user: any) {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['orderItems', 'orderItems.menuItem', 'restaurant', 'paymentMethod'],
    });

    if (!order) throw new NotFoundException('Order not found');

    if (user.role !== Role.ADMIN && order.countryId !== user.countryId) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async placeOrder(id: string, user: any, paymentMethodId?: string) {
    const order = await this.findOne(id, user); // checks constraints
    
    if (order.status !== OrderStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT orders can be placed');
    }
    
    if (order.orderItems.length === 0) {
      throw new BadRequestException('Cannot place an empty order');
    }

    if (paymentMethodId) {
      order.paymentMethodId = paymentMethodId;
    }

    if (!order.paymentMethodId) {
      throw new BadRequestException('A payment method is required to place the order');
    }

    order.status = OrderStatus.PLACED;
    order.placedAt = new Date();
    
    return this.orderRepo.save(order);
  }

  async cancelOrder(id: string, user: any) {
    const order = await this.findOne(id, user); // checks constraints
    
    if (order.status === OrderStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a COMPLETED order');
    }

    order.status = OrderStatus.CANCELLED;
    return this.orderRepo.save(order);
  }
}
