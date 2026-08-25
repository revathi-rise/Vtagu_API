import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserDevicesService } from './user-devices.service';
import { UserDevicesController } from './user-devices.controller';
import { UserDevice } from './entities/user-device.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { Plan } from '../plans/entities/plan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserDevice, Subscription, Plan])],
  controllers: [UserDevicesController],
  providers: [UserDevicesService],
  exports: [UserDevicesService],
})
export class UserDevicesModule {}

