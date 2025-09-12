import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { TestCase } from '../../test-case/entities/test-case.entity';
import { Evaluation } from '../../evaluation/entities/evaluation.entity';

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  inHouseModelId: string;

  @Column()
  baselineModelId: string;

  @Column({ default: false })
  isCompleted: boolean;

  @OneToMany(() => TestCase, testCase => testCase.session)
  testCases: TestCase[];

  @OneToMany(() => Evaluation, evaluation => evaluation.session)
  evaluations: Evaluation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 