import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Unique } from 'typeorm';
import { Member } from './member.entity';
import { Sport } from './sports.entity';

export enum SubscriptionType {
  GROUP = 'group',
  PRIVATE = 'private',
}

@Entity('sport_subscriptions')
@Unique(['memberId', 'sportId']) // Prevents duplicate subscriptions
export class SportSubscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'member_id' })
  memberId: number;

  @Column({ name: 'sport_id' })
  sportId: number;

  @Column({
    name: 'subscription_type',
    type: 'enum',
    enum: SubscriptionType,
  })
  subscriptionType: SubscriptionType;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Member, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @ManyToOne(() => Sport, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sport_id' })
  sport: Sport;
}