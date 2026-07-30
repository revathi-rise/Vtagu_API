import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShortsService } from './shorts.service';
import { ShortsController } from './shorts.controller';
import { Short } from './short.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Short])],
  providers: [ShortsService],
  controllers: [ShortsController],
  exports: [ShortsService],
})
export class ShortsModule {}
