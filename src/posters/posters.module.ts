import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostersController } from './posters.controller';
import { PostersService } from './posters.service';
import { Poster } from './poster.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Poster])],
  controllers: [PostersController],
  providers: [PostersService],
})
export class PostersModule {}
