import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('episode')
export class Episode {
  @PrimaryGeneratedColumn({ name: 'episode_id' })
  episodeId: number;

  @Column({ name: 'season_id' })
  seasonId: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  url: string;

  @Column({ nullable: true })
  image: string;
}
