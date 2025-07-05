import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { SportSubscriptionsService } from './services/subscriptions.services';
import { SportSubscription, SubscriptionType } from './entities/sport-subscription.entity';
import { Member, Gender } from './entities/member.entity';
import { Sport, AllowedGender } from './entities/sports.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

describe('SportSubscriptionsService', () => {
  let service: SportSubscriptionsService;
  let subscriptionRepository: jest.Mocked<Repository<SportSubscription>>;
  let memberRepository: jest.Mocked<Repository<Member>>;
  let sportRepository: jest.Mocked<Repository<Sport>>;

  // Mock data
  const mockMember = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    gender: Gender.MALE,
    birthdate: new Date('1990-01-01'),
    subscriptionDate: new Date(),
  } as Member;

  const mockFemaleMember = {
    id: 2,
    firstName: 'Jane',
    lastName: 'Smith',
    gender: Gender.FEMALE,
    birthdate: new Date('1992-05-15'),
    subscriptionDate: new Date(),
  } as Member;

  const mockMaleSport = {
    id: 1,
    name: 'Football',
    subscriptionPrice: 50.00,
    allowedGender: AllowedGender.MALE,
  } as Sport;

  const mockFemaleSport = {
    id: 2,
    name: 'Volleyball',
    subscriptionPrice: 40.00,
    allowedGender: AllowedGender.FEMALE,
  } as Sport;

  const mockMixedSport = {
    id: 3,
    name: 'Tennis',
    subscriptionPrice: 60.00,
    allowedGender: AllowedGender.MIX,
  } as Sport;

  const mockSubscription = {
    id: 1,
    memberId: 1,
    sportId: 1,
    subscriptionType: SubscriptionType.GROUP,
    createdAt: new Date(),
    member: {} as Member,
    sport: {} as Sport,
  } as SportSubscription;

  const mockCreateSubscriptionDto: CreateSubscriptionDto = {
    memberId: 1,
    sportId: 1,
    subscriptionType: SubscriptionType.GROUP,
  };

  beforeEach(async () => {
    // Create mock repositories
    const mockSubscriptionRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      find: jest.fn(),
    };

    const mockMemberRepo = {
      findOne: jest.fn(),
    };

    const mockSportRepo = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SportSubscriptionsService,
        {
          provide: getRepositoryToken(SportSubscription),
          useValue: mockSubscriptionRepo,
        },
        {
          provide: getRepositoryToken(Member),
          useValue: mockMemberRepo,
        },
        {
          provide: getRepositoryToken(Sport),
          useValue: mockSportRepo,
        },
      ],
    }).compile();

    service = module.get<SportSubscriptionsService>(SportSubscriptionsService);
    subscriptionRepository = module.get(getRepositoryToken(SportSubscription));
    memberRepository = module.get(getRepositoryToken(Member));
    sportRepository = module.get(getRepositoryToken(Sport));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('subscribe', () => {
    it('should successfully create a subscription for compatible gender', async () => {
      // Arrange
      memberRepository.findOne.mockResolvedValue(mockMember);
      sportRepository.findOne.mockResolvedValue(mockMaleSport);
      subscriptionRepository.findOne.mockResolvedValue(null);
      subscriptionRepository.create.mockReturnValue(mockSubscription);
      subscriptionRepository.save.mockResolvedValue(mockSubscription);

      // Act
      const result = await service.subscribe(mockCreateSubscriptionDto);

      // Assert
      expect(result).toEqual(mockSubscription);
      expect(memberRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(sportRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(subscriptionRepository.findOne).toHaveBeenCalledWith({
        where: { memberId: 1, sportId: 1 },
      });
      expect(subscriptionRepository.create).toHaveBeenCalledWith({
        memberId: 1,
        sportId: 1,
        subscriptionType: SubscriptionType.GROUP,
      });
      expect(subscriptionRepository.save).toHaveBeenCalledWith(mockSubscription);
    });

    it('should allow subscription to mixed gender sports', async () => {
      // Arrange
      memberRepository.findOne.mockResolvedValue(mockMember);
      sportRepository.findOne.mockResolvedValue(mockMixedSport);
      subscriptionRepository.findOne.mockResolvedValue(null);
      subscriptionRepository.create.mockReturnValue(mockSubscription);
      subscriptionRepository.save.mockResolvedValue(mockSubscription);

      const mixedSportDto = { ...mockCreateSubscriptionDto, sportId: 3 };

      // Act
      const result = await service.subscribe(mixedSportDto);

      // Assert
      expect(result).toEqual(mockSubscription);
      expect(sportRepository.findOne).toHaveBeenCalledWith({ where: { id: 3 } });
    });

    it('should allow female member to subscribe to female sport', async () => {
      // Arrange
      memberRepository.findOne.mockResolvedValue(mockFemaleMember);
      sportRepository.findOne.mockResolvedValue(mockFemaleSport);
      subscriptionRepository.findOne.mockResolvedValue(null);
      subscriptionRepository.create.mockReturnValue(mockSubscription);
      subscriptionRepository.save.mockResolvedValue(mockSubscription);

      const femaleSubscriptionDto = { ...mockCreateSubscriptionDto, memberId: 2, sportId: 2 };

      // Act
      const result = await service.subscribe(femaleSubscriptionDto);

      // Assert
      expect(result).toEqual(mockSubscription);
    });

    it('should throw NotFoundException when member does not exist', async () => {
      // Arrange
      memberRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.subscribe(mockCreateSubscriptionDto)).rejects.toThrow(
        new NotFoundException('Member with ID 1 not found')
      );
      expect(memberRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(sportRepository.findOne).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when sport does not exist', async () => {
      // Arrange
      memberRepository.findOne.mockResolvedValue(mockMember);
      sportRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.subscribe(mockCreateSubscriptionDto)).rejects.toThrow(
        new NotFoundException('Sport with ID 1 not found')
      );
      expect(memberRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(sportRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw BadRequestException when gender is incompatible', async () => {
      // Arrange
      memberRepository.findOne.mockResolvedValue(mockMember);
      sportRepository.findOne.mockResolvedValue(mockFemaleSport);

      const incompatibleDto = { ...mockCreateSubscriptionDto, sportId: 2 };

      // Act & Assert
      await expect(service.subscribe(incompatibleDto)).rejects.toThrow(
        new BadRequestException('Sport Volleyball is only available for female members')
      );
    });

    it('should throw ConflictException when subscription already exists', async () => {
      // Arrange
      memberRepository.findOne.mockResolvedValue(mockMember);
      sportRepository.findOne.mockResolvedValue(mockMaleSport);
      subscriptionRepository.findOne.mockResolvedValue(mockSubscription);

      // Act & Assert
      await expect(service.subscribe(mockCreateSubscriptionDto)).rejects.toThrow(
        new ConflictException('Member is already subscribed to this sport')
      );
    });

    it('should handle database unique constraint violation', async () => {
      // Arrange
      memberRepository.findOne.mockResolvedValue(mockMember);
      sportRepository.findOne.mockResolvedValue(mockMaleSport);
      subscriptionRepository.findOne.mockResolvedValue(null);
      subscriptionRepository.create.mockReturnValue(mockSubscription);
      
      const dbError = new Error('Duplicate entry');
      (dbError as any).code = '23505';
      subscriptionRepository.save.mockRejectedValue(dbError);

      // Act & Assert
      await expect(service.subscribe(mockCreateSubscriptionDto)).rejects.toThrow(
        new ConflictException('Member is already subscribed to this sport')
      );
    });

    it('should rethrow other database errors', async () => {
      // Arrange
      memberRepository.findOne.mockResolvedValue(mockMember);
      sportRepository.findOne.mockResolvedValue(mockMaleSport);
      subscriptionRepository.findOne.mockResolvedValue(null);
      subscriptionRepository.create.mockReturnValue(mockSubscription);
      
      const dbError = new Error('Database connection error');
      subscriptionRepository.save.mockRejectedValue(dbError);

      // Act & Assert
      await expect(service.subscribe(mockCreateSubscriptionDto)).rejects.toThrow(dbError);
    });
  });

  describe('unsubscribe', () => {
    it('should successfully remove subscription', async () => {
      // Arrange
      subscriptionRepository.findOne.mockResolvedValue(mockSubscription);
      subscriptionRepository.remove.mockResolvedValue(mockSubscription);

      // Act
      await service.unsubscribe(1, 1);

      // Assert
      expect(subscriptionRepository.findOne).toHaveBeenCalledWith({
        where: { memberId: 1, sportId: 1 },
      });
      expect(subscriptionRepository.remove).toHaveBeenCalledWith(mockSubscription);
    });

    it('should throw NotFoundException when subscription does not exist', async () => {
      // Arrange
      subscriptionRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.unsubscribe(1, 1)).rejects.toThrow(
        new NotFoundException('Subscription not found')
      );
      expect(subscriptionRepository.findOne).toHaveBeenCalledWith({
        where: { memberId: 1, sportId: 1 },
      });
      expect(subscriptionRepository.remove).not.toHaveBeenCalled();
    });
  });

  describe('getMemberSubscriptions', () => {
    it('should return member subscriptions with relations', async () => {
      // Arrange
      const mockSubscriptions = [mockSubscription];
      subscriptionRepository.find.mockResolvedValue(mockSubscriptions);

      // Act
      const result = await service.getMemberSubscriptions(1);

      // Assert
      expect(result).toEqual(mockSubscriptions);
      expect(subscriptionRepository.find).toHaveBeenCalledWith({
        where: { memberId: 1 },
        relations: ['sport'],
      });
    });

    it('should return empty array when member has no subscriptions', async () => {
      // Arrange
      subscriptionRepository.find.mockResolvedValue([]);

      // Act
      const result = await service.getMemberSubscriptions(1);

      // Assert
      expect(result).toEqual([]);
      expect(subscriptionRepository.find).toHaveBeenCalledWith({
        where: { memberId: 1 },
        relations: ['sport'],
      });
    });
  });

  describe('isGenderCompatible (private method testing through subscribe)', () => {
    it('should allow male member to subscribe to male sport', async () => {
      // Arrange
      memberRepository.findOne.mockResolvedValue(mockMember);
      sportRepository.findOne.mockResolvedValue(mockMaleSport);
      subscriptionRepository.findOne.mockResolvedValue(null);
      subscriptionRepository.create.mockReturnValue(mockSubscription);
      subscriptionRepository.save.mockResolvedValue(mockSubscription);

      // Act
      const result = await service.subscribe(mockCreateSubscriptionDto);

      // Assert
      expect(result).toEqual(mockSubscription);
    });

    it('should allow female member to subscribe to female sport', async () => {
      // Arrange
      memberRepository.findOne.mockResolvedValue(mockFemaleMember);
      sportRepository.findOne.mockResolvedValue(mockFemaleSport);
      subscriptionRepository.findOne.mockResolvedValue(null);
      subscriptionRepository.create.mockReturnValue(mockSubscription);
      subscriptionRepository.save.mockResolvedValue(mockSubscription);

      const femaleDto = { ...mockCreateSubscriptionDto, memberId: 2, sportId: 2 };

      // Act
      const result = await service.subscribe(femaleDto);

      // Assert
      expect(result).toEqual(mockSubscription);
    });

    it('should allow any gender to subscribe to mixed sport', async () => {
      // Arrange
      memberRepository.findOne.mockResolvedValue(mockMember);
      sportRepository.findOne.mockResolvedValue(mockMixedSport);
      subscriptionRepository.findOne.mockResolvedValue(null);
      subscriptionRepository.create.mockReturnValue(mockSubscription);
      subscriptionRepository.save.mockResolvedValue(mockSubscription);

      const mixedDto = { ...mockCreateSubscriptionDto, sportId: 3 };

      // Act
      const result = await service.subscribe(mixedDto);

      // Assert
      expect(result).toEqual(mockSubscription);
    });

    it('should reject male member subscribing to female sport', async () => {
      // Arrange
      memberRepository.findOne.mockResolvedValue(mockMember);
      sportRepository.findOne.mockResolvedValue(mockFemaleSport);

      const incompatibleDto = { ...mockCreateSubscriptionDto, sportId: 2 };

      // Act & Assert
      await expect(service.subscribe(incompatibleDto)).rejects.toThrow(
        new BadRequestException('Sport Volleyball is only available for female members')
      );
    });

    it('should reject female member subscribing to male sport', async () => {
      // Arrange
      memberRepository.findOne.mockResolvedValue(mockFemaleMember);
      sportRepository.findOne.mockResolvedValue(mockMaleSport);

      const incompatibleDto = { ...mockCreateSubscriptionDto, memberId: 2, sportId: 1 };

      // Act & Assert
      await expect(service.subscribe(incompatibleDto)).rejects.toThrow(
        new BadRequestException('Sport Football is only available for male members')
      );
    });
  });
});