import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SportsService } from '../services/sports.services';
import { SportsController } from '../controllers/sports-controller';
import { Sport } from '../entities/sports.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sport])],
  controllers: [SportsController],
  providers: [SportsService],
  exports: [SportsService],
})
export class SportsModule {}