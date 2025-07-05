// src/sports/sports.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sport } from '../entities/sports.entity'
import { CreateSportDto } from '../dto/create-sport.dto';
import { UpdateSportDto } from '../dto/update-sport.dto';

@Injectable()
export class SportsService {
  // ✅ ADD: Cache properties for performance optimization
  private sportsCache: Sport[] | null = null;
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor(
    @InjectRepository(Sport)
    private readonly sportRepository: Repository<Sport>,
  ) {}

  async create(createSportDto: CreateSportDto): Promise<Sport> {
    try {
      const sport = this.sportRepository.create(createSportDto);
      const savedSport = await this.sportRepository.save(sport);
      
      // ✅ ADD: Invalidate cache after creating new sport
      this.invalidateCache();
      
      return savedSport;
    } catch (error) {
      if (error.code === '23505') { // PostgreSQL unique constraint violation
        throw new ConflictException('Sport with this name already exists');
      }
      throw error;
    }
  }

  async findAll(): Promise<Sport[]> {
    // ✅ CHANGE: Implement actual caching instead of just comment
    // Check if cache is valid
    if (this.sportsCache && Date.now() < this.cacheExpiry) {
      return this.sportsCache;
    }

    // Fetch from database with optimized query
    const sports = await this.sportRepository.find({
      select: ['id', 'name', 'subscriptionPrice', 'allowedGender'], // ✅ ADD: Select only needed fields
      order: { name: 'ASC' },
    });

    // Update cache
    this.sportsCache = sports;
    this.cacheExpiry = Date.now() + this.CACHE_DURATION;

    return sports;
  }

  async findOne(id: number): Promise<Sport> {
    const sport = await this.sportRepository.findOne({ where: { id } });
    if (!sport) {
      throw new NotFoundException(`Sport with ID ${id} not found`);
    }
    return sport;
  }

  async update(id: number, updateSportDto: UpdateSportDto): Promise<Sport> {
    const sport = await this.findOne(id);
        
    try {
      await this.sportRepository.update(id, updateSportDto);
      const updatedSport = await this.findOne(id);
      
      // ✅ ADD: Invalidate cache after updating sport
      this.invalidateCache();
      
      return updatedSport;
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Sport with this name already exists');
      }
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    const sport = await this.findOne(id);
    await this.sportRepository.remove(sport);
    
    // ✅ ADD: Invalidate cache after removing sport
    this.invalidateCache();
  }

  // ✅ ADD: Private method to invalidate cache
  private invalidateCache(): void {
    this.sportsCache = null;
    this.cacheExpiry = 0;
  }
}