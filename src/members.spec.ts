// src/members/members.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MembersService } from './services/member.services';
import { Member, Gender } from './entities/member.entity';

describe('MembersService', () => {
  let service: MembersService;
  let repository: Repository<Member>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembersService,
        {
          provide: getRepositoryToken(Member),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<MembersService>(MembersService);
    repository = module.get<Repository<Member>>(getRepositoryToken(Member));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new member', async () => {
      const createMemberDto = {
        firstName: 'John',
        lastName: 'Doe',
        gender: Gender.MALE,
        birthdate: '1990-01-01',
      };

      const member = { id: 1, ...createMemberDto, birthdate: new Date('1990-01-01') };
      mockRepository.create.mockReturnValue(member);
      mockRepository.save.mockResolvedValue(member);

      const result = await service.create(createMemberDto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createMemberDto,
        birthdate: new Date('1990-01-01'),
      });
      expect(result).toEqual(member);
    });

    it('should throw BadRequestException when family head not found', async () => {
      const createMemberDto = {
        firstName: 'John',
        lastName: 'Doe',
        gender: Gender.MALE,
        birthdate: '1990-01-01',
        familyHeadId: 999,
      };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createMemberDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return a member by id', async () => {
      const member = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        gender: Gender.MALE,
        birthdate: new Date('1990-01-01'),
      };
      mockRepository.findOne.mockResolvedValue(member);

      const result = await service.findOne(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['familyHead', 'familyMembers'],
      });
      expect(result).toEqual(member);
    });

    it('should throw NotFoundException when member not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });
});