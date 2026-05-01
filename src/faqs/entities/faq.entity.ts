import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('faq')
export class Faq {
  @PrimaryGeneratedColumn()
  faq_id: number;

  @Column({ type: 'text' })
  question: string;

  @Column({ type: 'text' })
  answer: string;
}
