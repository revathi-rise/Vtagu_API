import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScenesService } from './scenes.service';
import { ScenesController } from './scenes.controller';
import { Scene } from './entities/scene.entity';
import { Choice } from '../choices/entities/choice.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Scene, Choice])],
  providers: [ScenesService],
  controllers: [ScenesController],
})
export class ScenesModule {}
