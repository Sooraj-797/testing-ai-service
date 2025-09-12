import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Session } from '../../session/entities/session.entity';
import { SubCategory } from '../../category/entities/sub-category.entity';
import { Evaluation } from '../../evaluation/entities/evaluation.entity';

@Entity('test_cases')
export class TestCase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  prompt: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  expectedOutput: string;

  @ManyToOne(() => Session, session => session.testCases)
  @JoinColumn({ name: 'session_id' })
  session: Session;

  @Column({ name: 'session_id' })
  sessionId: string;

  @ManyToOne(() => SubCategory, subCategory => subCategory.testCases)
  @JoinColumn({ name: 'sub_category_id' })
  subCategory: SubCategory;

  @Column({ name: 'sub_category_id' })
  subCategoryId: string;

  @Column({ nullable: true })
  retrievedChunks: string; // JSON string containing retrieved chunks

  @OneToMany(() => Evaluation, evaluation => evaluation.testCase)
  evaluations: Evaluation[];
} 