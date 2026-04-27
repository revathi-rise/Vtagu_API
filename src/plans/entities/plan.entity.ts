import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('plan')
export class Plan {
  @PrimaryGeneratedColumn({ name: 'plan_id' })
  planId: number;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'int' })
  screens: number;

  @Column({ length: 255 })
  quality: string;

  @Column({ type: 'int' })
  compatibility: number;

  @Column({ type: 'int' })
  unlimited: number;

  @Column({ type: 'int' })
  cancellation: number;

  @Column({ type: 'float' })
  price: number;

  @Column({ type: 'float' })
  discount: number;

  @Column({ length: 255 })
  validity: string;

  @Column({ type: 'int', default: 1 })
  status: number; // 1 active, 0 inactive
}
