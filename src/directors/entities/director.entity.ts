import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('director')
export class Director {
  @PrimaryGeneratedColumn()
  director_id: number;

  @Column({ length: 500 })
  name: string;
}
