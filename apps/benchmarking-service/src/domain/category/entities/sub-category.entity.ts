import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Category } from './category.entity';
import { TestCase } from '../../test-case/entities/test-case.entity';

@Entity('sub_categories')
export class SubCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => Category, category => category.subCategories)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'category_id' })
  categoryId: string;

  @OneToMany(() => TestCase, testCase => testCase.subCategory)
  testCases: TestCase[];
} 