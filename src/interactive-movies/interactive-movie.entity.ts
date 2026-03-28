import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('interactive_movie')
export class InteractiveMovie {
  @PrimaryGeneratedColumn()
  interactive_movie_id: number;

  @Column({ length: 150 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @CreateDateColumn()
  created_at: Date;
}
