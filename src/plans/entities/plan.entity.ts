import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('plan')
export class Plan {
  @PrimaryGeneratedColumn({ name: 'plan_id' })
  planId: number;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'int', nullable: true })
  screens: number;

  @Column({ length: 255, nullable: true })
  quality: string;

  @Column({ type: 'int', default: 1, nullable: true })
  compatibility: number;

  @Column({ type: 'int', default: 1, nullable: true })
  unlimited: number;

  @Column({ type: 'int', default: 0, nullable: true })
  cancellation: number;

  @Column({ type: 'float' })
  price: number;

  @Column({ type: 'float' })
  discount: number;

  @Column({ length: 255 })
  validity: string;

  @Column({ type: 'int', default: 1 })
  status: number; // 1 active, 0 inactive

  @Column({ length: 255, default: 'INR' })
  currency: string;

  @Column({ type: 'tinyint', default: 0, name: 'is_interactive_included' })
  isInteractiveIncluded: number;

  @Column({ length: 500, nullable: true })
  description: string;
}

