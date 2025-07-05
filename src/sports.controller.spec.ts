import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { SportsService } from './services/sports.services';
import { Sport, AllowedGender } from './entities/sports.entity';

describe('SportsService', () => {
  let service: SportsService;
  let repository: Repository<Sport>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SportsService,
        {
          provide: getRepositoryToken(Sport),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<SportsService>(SportsService);
    repository = module.get<Repository<Sport>>(getRepositoryToken(Sport));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new sport', async () => {
      const createSportDto = {
        name: 'Football',
        subscriptionPrice: 100,
        allowedGender: AllowedGender.MIX,
      };

      const sport = { id: 1, ...createSportDto };
      mockRepository.create.mockReturnValue(sport);
      mockRepository.save.mockResolvedValue(sport);

      const result = await service.create(createSportDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createSportDto);
      expect(mockRepository.save).toHaveBeenCalledWith(sport);
      expect(result).toEqual(sport);
    });

    it('should throw ConflictException when sport name already exists', async () => {
      const createSportDto = {
        name: 'Football',
        subscriptionPrice: 100,
        allowedGender: AllowedGender.MIX,
      };

      const sport = { id: 1, ...createSportDto };
      mockRepository.create.mockReturnValue(sport);
      mockRepository.save.mockRejectedValue({ code: '23505' });

      await expect(service.create(createSportDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all sports', async () => {
      const sports = [
        { id: 1, name: 'Football', subscriptionPrice: 100, allowedGender: AllowedGender.MIX },
        { id: 2, name: 'Basketball', subscriptionPrice: 80, allowedGender: AllowedGender.MIX },
      ];

      mockRepository.find.mockResolvedValue(sports);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
        order: { name: 'ASC' },
      });
      expect(result).toEqual(sports);
    });
  });

  describe('findOne', () => {
    it('should return a sport by id', async () => {
      const sport = { id: 1, name: 'Football', subscriptionPrice: 100, allowedGender: AllowedGender.MIX };
      mockRepository.findOne.mockResolvedValue(sport);

      const result = await service.findOne(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(sport);
    });

    it('should throw NotFoundException when sport not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a sport', async () => {
      const updateSportDto = { name: 'Updated Football' };
      const existingSport = { id: 1, name: 'Football', subscriptionPrice: 100, allowedGender: AllowedGender.MIX };
      const updatedSport = { ...existingSport, ...updateSportDto };

      mockRepository.findOne
        .mockResolvedValueOnce(existingSport)
        .mockResolvedValueOnce(updatedSport);
      mockRepository.update.mockResolvedValue(undefined);

      const result = await service.update(1, updateSportDto);

      expect(mockRepository.update).toHaveBeenCalledWith(1, updateSportDto);
      expect(result).toEqual(updatedSport);
    });
  });

  describe('remove', () => {
    it('should remove a sport', async () => {
      const sport = { id: 1, name: 'Football', subscriptionPrice: 100, allowedGender: AllowedGender.MIX };
      mockRepository.findOne.mockResolvedValue(sport);
      mockRepository.remove.mockResolvedValue(undefined);

      await service.remove(1);

      expect(mockRepository.remove).toHaveBeenCalledWith(sport);
    });
  });
});