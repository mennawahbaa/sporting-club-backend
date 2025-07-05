// src/sports/sports.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SportsService } from '../services/sports.services';
import { CreateSportDto } from '../dto/create-sport.dto';
import { UpdateSportDto } from '../dto/update-sport.dto';

@Controller('sports')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class SportsController {
  constructor(private readonly sportsService: SportsService) {}

  @Post()
  create(@Body() createSportDto: CreateSportDto) {
    return this.sportsService.create(createSportDto);
  }

  @Get()
  findAll() {
    return this.sportsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sportsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSportDto: UpdateSportDto,
  ) {
    return this.sportsService.update(id, updateSportDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sportsService.remove(id);
  }
}