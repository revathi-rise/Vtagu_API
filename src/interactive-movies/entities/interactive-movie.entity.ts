import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('interactive_movies')
export class InteractiveMovie {
  @PrimaryGeneratedColumn({ name: 'interactive_movie_id' })
  interactive_movie_id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
