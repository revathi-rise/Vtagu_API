import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('languages')
export class Language {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 10 })
  code: string;

  @Column({ length: 255, unique: true })
  slug: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
