import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Scene } from '../../scenes/entities/scene.entity';

@Entity('interactive_choices')
export class Choice {
  @PrimaryGeneratedColumn()
  choice_id: number;

  @Column()
  scene_id: number;

  @Column()
  button_text: string;

  @Column({ nullable: true })
  target_scene: number;

  @ManyToOne(() => Scene, (scene) => scene.choices)
  @JoinColumn({ name: 'scene_id' })
  scene: Scene;

  @ManyToOne(() => Scene)
  @JoinColumn({ name: 'target_scene' })
  targetScene: Scene;
}
