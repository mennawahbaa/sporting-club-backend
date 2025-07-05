
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { SubscriptionType } from '../entities/sport-subscription.entity';

export class CreateSubscriptionDto {
  @IsNotEmpty()
  @IsNumber()
  memberId: number;

  @IsNotEmpty()
  @IsNumber()
  sportId: number;

  @IsNotEmpty()
  @IsEnum(SubscriptionType)
  subscriptionType: SubscriptionType;
}