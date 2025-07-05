
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from '../entities/member.entity';
import { CreateMemberDto } from '../dto/create-member.dto';
import { UpdateMemberDto } from '../dto/update-member.dto';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
  ) {}

  async create(createMemberDto: CreateMemberDto): Promise<Member> {
    // Validate family head exists if provided
    if (createMemberDto.familyHeadId) {
      const familyHead = await this.memberRepository.findOne({
        where: { id: createMemberDto.familyHeadId },
      });
      if (!familyHead) {
        throw new BadRequestException('Family head not found');
      }
    }

    const member = this.memberRepository.create({
      ...createMemberDto,
      birthdate: new Date(createMemberDto.birthdate),
    });
    
    return await this.memberRepository.save(member);
  }

  async findOne(id: number): Promise<Member> {
    const member = await this.memberRepository.findOne({
      where: { id },
      relations: ['familyHead', 'familyMembers'],
    });
    
    if (!member) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }
    
    return member;
  }

async update(id: number, updateMemberDto: UpdateMemberDto): Promise<Member> {
  const member = await this.findOne(id);
  
  // Validate family head exists if provided
  if (updateMemberDto.familyHeadId) {
    const familyHead = await this.memberRepository.findOne({
      where: { id: updateMemberDto.familyHeadId },
    });
    if (!familyHead) {
      throw new BadRequestException('Family head not found');
    }
    
    // Check for circular dependency
    const wouldCreateCircularDependency = await this.checkCircularDependency(
      id, 
      updateMemberDto.familyHeadId
    );
    
    if (wouldCreateCircularDependency) {
      throw new BadRequestException(
        'Cannot set family head: This would create a circular dependency in the family hierarchy'
      );
    }
  }

  const updateData = {
    ...updateMemberDto,
    ...(updateMemberDto.birthdate && { birthdate: new Date(updateMemberDto.birthdate) }),
  };

  await this.memberRepository.update(id, updateData);
  return await this.findOne(id);
}

// Helper method to check for circular dependencies
private async checkCircularDependency(
  memberId: number, 
  proposedFamilyHeadId: number
): Promise<boolean> {
  // If trying to set self as family head, it's circular
  if (memberId === proposedFamilyHeadId) {
    return true;
  }
  
  // Check if the proposed family head has the current member as their family head
  // (directly or indirectly through the chain)
  const visited = new Set<number>();
  return await this.isInFamilyChain(proposedFamilyHeadId, memberId, visited);
}

// Recursive method to check if targetId is in the family chain of startId
private async isInFamilyChain(
  startId: number, 
  targetId: number, 
  visited: Set<number>
): Promise<boolean> {
  // Prevent infinite loops
  if (visited.has(startId)) {
    return false;
  }
  
  visited.add(startId);
  
  // Get the current member's family head
  const member = await this.memberRepository.findOne({
    where: { id: startId },
    select: ['id', 'familyHeadId'],
  });
  
  if (!member || !member.familyHeadId) {
    return false;
  }
  
  // If we found the target in the chain, it's circular
  if (member.familyHeadId === targetId) {
    return true;
  }
  
  // Continue checking up the chain
  return await this.isInFamilyChain(member.familyHeadId, targetId, visited);
}

// Alternative iterative approach (more efficient for deep hierarchies)
private async checkCircularDependencyIterative(
  memberId: number, 
  proposedFamilyHeadId: number
): Promise<boolean> {
  if (memberId === proposedFamilyHeadId) {
    return true;
  }
  
  const visited = new Set<number>();
  let currentId = proposedFamilyHeadId;
  
  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    
    const member = await this.memberRepository.findOne({
      where: { id: currentId },
      select: ['id', 'familyHeadId'],
    });
    
    if (!member || !member.familyHeadId) {
      break;
    }
    
    if (member.familyHeadId === memberId) {
      return true;
    }
    
    currentId = member.familyHeadId;
  }
  
  return false;
}

// Optional: Method to get the complete family hierarchy for validation
async getFamilyHierarchy(memberId: number): Promise<number[]> {
  const hierarchy: number[] = [];
  const visited = new Set<number>();
  let currentId = memberId;
  
  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    hierarchy.push(currentId);
    
    const member = await this.memberRepository.findOne({
      where: { id: currentId },
      select: ['id', 'familyHeadId'],
    });
    
    if (!member || !member.familyHeadId) {
      break;
    }
    
    currentId = member.familyHeadId;
  }
  
  return hierarchy;
}
// Approach combining database constraints with manual reassignment
async remove(id: number): Promise<void> {
  const member = await this.findOne(id);
  
  // If the member being removed has a family head, reassign dependents to that family head
  if (member.familyHeadId) {
    await this.memberRepository.update(
      { familyHeadId: id },
      { familyHeadId: member.familyHeadId }
    );
  }
  
  // Remove the member - database constraints will handle any remaining references
  await this.memberRepository.remove(member);
}

// With details about what was affected
async removeWithDetails(id: number): Promise<{ removedMember: Member; reassignedCount: number }> {
  const member = await this.findOne(id);
  
  let reassignedCount = 0;
  
  // If the member being removed has a family head, reassign dependents to that family head
  if (member.familyHeadId) {
    const dependentMembers = await this.memberRepository.find({
      where: { familyHeadId: id },
    });
    
    if (dependentMembers.length > 0) {
      await this.memberRepository.update(
        { familyHeadId: id },
        { familyHeadId: member.familyHeadId }
      );
      reassignedCount = dependentMembers.length;
    }
  }
  
  // Remove the member - database constraints will handle any remaining references
  await this.memberRepository.remove(member);
  
  return {
    removedMember: member,
    reassignedCount,
  };
}

// If you want to preview the impact before deletion
async previewRemovalImpact(id: number): Promise<{
  memberToRemove: Member;
  dependentMembers: Member[];
}> {
  const member = await this.findOne(id);
  
  const dependentMembers = await this.memberRepository.find({
    where: { familyHeadId: id },
    select: ['id', 'firstName', 'lastName'],
  });
  
  return {
    memberToRemove: member,
    dependentMembers,
  };
}
}