import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChoicesService } from './choices.service';
import { ChoicesController } from './choices.controller';
import { Choice } from './entities/choice.entity';
import { Scene } from '../scenes/entities/scene.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Choice, Scene])],
  providers: [ChoicesService],
  controllers: [ChoicesController],
})
export class ChoicesModule {}
