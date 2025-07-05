
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Gender } from '../entities/member.entity';

export class CreateMemberDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsEnum(Gender)
  gender: Gender;

  @IsNotEmpty()
  @IsDateString()
  birthdate: string;

  @IsOptional()
  @IsNumber()
  familyHeadId?: number;
}