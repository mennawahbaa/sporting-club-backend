import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

@Entity('members')
export class Member {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({
    type: 'enum',
    enum: Gender,
  })
  gender: Gender;

  @Column({ type: 'date' })
  birthdate: Date;

  @CreateDateColumn({ name: 'subscription_date' })
  subscriptionDate: Date;

  // Self-referencing relationship for family members
@Column({ name: 'family_head_id', nullable: true })
familyHeadId: number;

@ManyToOne(() => Member, (member) => member.familyMembers, { 
  nullable: true,
  onDelete: 'SET NULL'
})
@JoinColumn({ name: 'family_head_id' })
familyHead: Member;

@OneToMany(() => Member, (member) => member.familyHead)
familyMembers: Member[];
}