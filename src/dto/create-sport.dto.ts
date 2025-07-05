// src/sports/dto/create-sport.dto.ts
import { IsEnum, IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';
import { AllowedGender } from '../entities/sports.entity';

export class CreateSportDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  subscriptionPrice: number;

  @IsNotEmpty()
  @IsEnum(AllowedGender)
  allowedGender: AllowedGender;
}