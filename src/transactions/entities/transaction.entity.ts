import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'txn_id', unique: true })
  txn_id: string;

  @Column({ name: 'user_id' })
  user_id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ length: 1, default: 'P' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
