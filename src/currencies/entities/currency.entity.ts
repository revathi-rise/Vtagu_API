import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('currency')
export class Currency {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 20 })
  code: string;

  @Column({ length: 20 })
  symbol: string;

  @Column({ type: 'tinyint', default: 0 })
  paypal_supported: boolean;

  @Column({ type: 'tinyint', default: 0 })
  stripe_supported: boolean;
}
