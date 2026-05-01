import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('actor')
export class Actor {
  @PrimaryGeneratedColumn()
  actor_id: number;

  @Column({ length: 500 })
  name: string;
}
