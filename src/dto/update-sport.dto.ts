// src/sports/dto/update-sport.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateSportDto } from './create-sport.dto';

export class UpdateSportDto extends PartialType(CreateSportDto) {}