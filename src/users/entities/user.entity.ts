import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  userId: number;

  @Column({ unique: true })
  email: string;

  @Column()
  user_name: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  mobile: string;

  @Column({ nullable: true })
  otp: string;

  @Column({ default: false })
  otp_verified: boolean;

  @Column({ nullable: true, name: 'login_oauth_uid' })
  loginOauthUid: string;

  @Column({ nullable: true })
  age: number;

  @Column({ nullable: true })
  dob: string;

  @Column({ nullable: true })
  type: string; // 'email', 'phone', 'oauth'

  @Column({ nullable: true })
  gender: string;

  @Column({ default: 0 })
  register_step: number;

  @Column({ nullable: true })
  profile_picture: string;

  @Column({ nullable: true })
  card_name: string;

  @Column({ nullable: true })
  card_number: string;

  @Column({ nullable: true })
  card_expiry: string;

  @Column({ nullable: true })
  card_ccv: string;

  @Column({ nullable: true })
  upi: string;

  @Column({ nullable: true })
  plan: string;

  @Column({ default: 'active' })
  status: string; // 'active', 'inactive', 'suspended'

  @Column({ nullable: true, type: 'longtext' })
  user_movielist: string;

  @Column({ nullable: true, type: 'longtext' })
  user_serieslist: string;

  @Column({ nullable: true, type: 'longtext' })
  user_movie_fav: string;

  @Column({ nullable: true, type: 'longtext' })
  user_series_fav: string;

  @Column({ nullable: true })
  user_session: string;

  @Column({ nullable: true })
  forgot_otp: string;

  @Column({ nullable: true })
  login_otp: string;

  @Column({ default: false })
  logged_in: boolean;

  @Column({ default: 0 })
  log_count: number;

  @Column({ nullable: true })
  last_login_ip_address: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
