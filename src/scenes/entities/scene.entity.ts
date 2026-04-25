import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Movie } from '../../movies/movie.entity';
import { Choice } from '../../choices/entities/choice.entity';

@Entity('interactive_scenes')
export class Scene {
  @PrimaryGeneratedColumn()
  scene_id: number;

  @Column()
  movie_id: number;

  @Column({ name: 'scence_name' }) // Mapping the typo from DB
  scene_name: string;

  @Column({ name: 'scence_url' }) // Mapping the typo from DB
  scene_url: string;

  @ManyToOne(() => Movie)
  @JoinColumn({ name: 'movie_id' })
  movie: Movie;

  @OneToMany(() => Choice, (choice) => choice.scene)
  choices: Choice[];
}
