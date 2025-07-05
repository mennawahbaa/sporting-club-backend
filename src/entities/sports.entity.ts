import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum AllowedGender {
  MALE = 'male',
  FEMALE = 'female',
  MIX = 'mix',
}

@Entity('sports')
export class Sport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ name: 'subscription_price', type: 'decimal', precision: 10, scale: 2 })
  subscriptionPrice: number;

  @Column({
    name: 'allowed_gender',
    type: 'enum',
    enum: AllowedGender,
  })
  allowedGender: AllowedGender;
}