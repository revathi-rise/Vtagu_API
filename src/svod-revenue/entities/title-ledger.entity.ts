import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn, Index, Unique } from 'typeorm';

@Entity('title_ledger')
@Unique('uk_film_month', ['filmId', 'monthYear'])
@Index('idx_ledger_month', ['monthYear'])
export class TitleLedger {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'film_id', type: 'varchar', length: 255 })
  filmId: string;

  @Column({ name: 'month_year', type: 'varchar', length: 10 })
  monthYear: string;

  @Column({ name: 'total_allocated_revenue', type: 'decimal', precision: 12, scale: 4, default: 0.0000 })
  totalAllocatedRevenue: number;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}
