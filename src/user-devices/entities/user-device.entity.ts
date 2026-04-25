import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('user_devices')
export class UserDevice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column()
  device_id: string;

  @Column()
  device_name: string;

  @Column({ nullable: true })
  device_type: string; // 'mobile', 'tablet', 'desktop'

  @Column({ nullable: true })
  os: string; // 'iOS', 'Android', 'Windows', 'macOS'

  @Column({ nullable: true })
  os_version: string;

  @Column({ nullable: true })
  app_version: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ nullable: true })
  last_active: Date;

  @Column({ nullable: true })
  ip_address: string;

  @Column({ nullable: true })
  user_agent: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
