import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'module_name', unique: true })
  module_name: string;

  @Column({ nullable: true })
  description: string;
}
