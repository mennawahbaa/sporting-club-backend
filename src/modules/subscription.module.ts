// src/sport-subscriptions/sport-subscriptions.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SportSubscriptionsService } from '../services/subscriptions.services';
import { SportSubscription } from '../entities/sport-subscription.entity';
import { Member } from '../entities/member.entity';
import { Sport } from '../entities/sports.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SportSubscription, Member, Sport])],
  providers: [SportSubscriptionsService],
  exports: [SportSubscriptionsService],
})
export class SportSubscriptionsModule {}