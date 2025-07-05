
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembersService } from '../services/member.services';
import { MembersController } from '../controllers/member.controller';
import { Member } from '../entities/member.entity';
import { SportSubscriptionsModule } from './subscription.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Member]),
    SportSubscriptionsModule,
  ],
  controllers: [MembersController],
  providers: [MembersService],
  exports: [MembersService],
})
export class MembersModule {}