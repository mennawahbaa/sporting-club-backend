// src/sport-subscriptions/sport-subscriptions.service.ts
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SportSubscription } from '../entities/sport-subscription.entity';
import { Member, Gender } from '../entities/member.entity';
import { Sport, AllowedGender } from '../entities/sports.entity';
import { CreateSubscriptionDto } from '../dto/create-subscription.dto';

@Injectable()
export class SportSubscriptionsService {
  constructor(
    @InjectRepository(SportSubscription)
    private readonly subscriptionRepository: Repository<SportSubscription>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(Sport)
    private readonly sportRepository: Repository<Sport>,
  ) {}

  /**
   * Helper method to check if a member's gender is compatible with a sport's allowed gender
   */
  private isGenderCompatible(memberGender: Gender, sportAllowedGender: AllowedGender): boolean {
    // If sport allows mixed gender, anyone can join
    if (sportAllowedGender === AllowedGender.MIX) {
      return true;
    }
    
    // Check if member's gender matches sport's allowed gender
    return (
      (memberGender === Gender.MALE && sportAllowedGender === AllowedGender.MALE) ||
      (memberGender === Gender.FEMALE && sportAllowedGender === AllowedGender.FEMALE)
    );
  }

  async subscribe(createSubscriptionDto: CreateSubscriptionDto): Promise<SportSubscription> {
    const { memberId, sportId, subscriptionType } = createSubscriptionDto;

    // Validate member exists
    const member = await this.memberRepository.findOne({ where: { id: memberId } });
    if (!member) {
      throw new NotFoundException(`Member with ID ${memberId} not found`);
    }

    // Validate sport exists
    const sport = await this.sportRepository.findOne({ where: { id: sportId } });
    if (!sport) {
      throw new NotFoundException(`Sport with ID ${sportId} not found`);
    }

    // Check gender compatibility
    if (!this.isGenderCompatible(member.gender, sport.allowedGender)) {
      throw new BadRequestException(
        `Sport ${sport.name} is only available for ${sport.allowedGender} members`
      );
    }

    // Check for existing subscription (handled by unique constraint, but let's be explicit)
    const existingSubscription = await this.subscriptionRepository.findOne({
      where: { memberId, sportId },
    });

    if (existingSubscription) {
      throw new ConflictException('Member is already subscribed to this sport');
    }

    try {
      const subscription = this.subscriptionRepository.create({
        memberId,
        sportId,
        subscriptionType,
      });
      
      return await this.subscriptionRepository.save(subscription);
    } catch (error) {
      if (error.code === '23505') { // PostgreSQL unique constraint violation
        throw new ConflictException('Member is already subscribed to this sport');
      }
      throw error;
    }
  }

  async unsubscribe(memberId: number, sportId: number): Promise<void> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { memberId, sportId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    await this.subscriptionRepository.remove(subscription);
  }

  async getMemberSubscriptions(memberId: number): Promise<SportSubscription[]> {
    return await this.subscriptionRepository.find({
      where: { memberId },
      relations: ['sport'],
    });
  }
}