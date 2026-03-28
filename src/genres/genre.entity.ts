import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('genre')
export class Genre {
  @PrimaryGeneratedColumn()
  genre_id: number;

  @Column({ length: 500 })
  name: string;

  @Column({ type: 'char', length: 2, default: 'Y' })
  in_home: string;

  @Column({ length: 250, nullable: true, default: 'assets/global/fallback.jpg' })
  path: string;
}
