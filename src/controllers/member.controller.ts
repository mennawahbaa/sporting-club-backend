// src/members/members.controller.ts
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
import { MembersService } from '../services/member.services';
import { CreateMemberDto } from '../dto/create-member.dto';
import { UpdateMemberDto } from '../dto/update-member.dto';
import { SportSubscriptionsService } from '../services/subscriptions.services';
import { CreateSubscriptionDto } from '../dto/create-subscription.dto';

@Controller('members')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class MembersController {
  constructor(
    private readonly membersService: MembersService,
    private readonly subscriptionsService: SportSubscriptionsService,
  ) {}

  @Post()
  create(@Body() createMemberDto: CreateMemberDto) {
    return this.membersService.create(createMemberDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.membersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMemberDto: UpdateMemberDto,
  ) {
    return this.membersService.update(id, updateMemberDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.membersService.remove(id);
  }

  @Post(':id/subscribe')
  subscribe(
    @Param('id', ParseIntPipe) id: number,
    @Body() createSubscriptionDto: Omit<CreateSubscriptionDto, 'memberId'>,
  ) {
    return this.subscriptionsService.subscribe({
      ...createSubscriptionDto,
      memberId: id,
    });
  }

  @Delete(':id/unsubscribe/:sportId')
  unsubscribe(
    @Param('id', ParseIntPipe) id: number,
    @Param('sportId', ParseIntPipe) sportId: number,
  ) {
    return this.subscriptionsService.unsubscribe(id, sportId);
  }

  @Get(':id/subscriptions')
  getSubscriptions(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionsService.getMemberSubscriptions(id);
  }
}