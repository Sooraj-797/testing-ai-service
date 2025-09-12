import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Session } from '../../session/entities/session.entity';
import { TestCase } from '../../test-case/entities/test-case.entity';

@Entity('evaluations')
export class Evaluation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Session, session => session.evaluations)
  @JoinColumn({ name: 'session_id' })
  session: Session;

  @Column({ name: 'session_id' })
  sessionId: string;

  @ManyToOne(() => TestCase, testCase => testCase.evaluations)
  @JoinColumn({ name: 'test_case_id' })
  testCase: TestCase;

  @Column({ name: 'test_case_id' })
  testCaseId: string;

  @Column()
  inHouseModelResponse: string;

  @Column()
  baselineModelResponse: string;

  @Column({ type: 'float' })
  score: number; // Score between 0-1 representing how well the in-house model performed

  @Column({ nullable: true })
  evaluationNotes: string;

  @CreateDateColumn()
  createdAt: Date;
} 