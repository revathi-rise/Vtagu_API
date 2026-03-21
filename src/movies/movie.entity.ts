import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Movie {
  @PrimaryGeneratedColumn()
  movie_id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description_short?: string;

  @Column({ nullable: true })
  movie_image?: string;
}
