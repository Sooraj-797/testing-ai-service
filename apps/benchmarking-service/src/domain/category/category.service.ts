import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { SubCategory } from './entities/sub-category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(SubCategory)
    private readonly subCategoryRepository: Repository<SubCategory>,
  ) {}

  /**
   * Create a new category
   * @param createCategoryDto Category creation data
   * @returns Created category
   */
  async createCategory(createCategoryDto: CreateCategoryDto): Promise<Category> {
    try {
      const category = this.categoryRepository.create(createCategoryDto);
      return await this.categoryRepository.save(category);
    } catch (error) {
      this.logger.error(`Failed to create category: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all categories
   * @returns Array of categories with subcategories
   */
  async getCategories(): Promise<Category[]> {
    try {
      return await this.categoryRepository.find({
        relations: ['subCategories'],
      });
    } catch (error) {
      this.logger.error(`Failed to get categories: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create a new subcategory
   * @param createSubCategoryDto Subcategory creation data
   * @returns Created subcategory
   */
  async createSubcategory(createSubCategoryDto: CreateSubCategoryDto): Promise<SubCategory> {
    try {
      // Check if the category exists
      const category = await this.categoryRepository.findOne({
        where: { id: createSubCategoryDto.categoryId },
      });

      if (!category) {
        throw new Error(`Category with ID ${createSubCategoryDto.categoryId} not found`);
      }

      const subCategory = this.subCategoryRepository.create(createSubCategoryDto);
      return await this.subCategoryRepository.save(subCategory);
    } catch (error) {
      this.logger.error(`Failed to create subcategory: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get subcategories by category
   * @param categoryId Category ID
   * @returns Array of subcategories
   */
  async getSubcategories(categoryId: string): Promise<SubCategory[]> {
    try {
      return await this.subCategoryRepository.find({
        where: { categoryId },
      });
    } catch (error) {
      this.logger.error(`Failed to get subcategories: ${error.message}`);
      throw error;
    }
  }
} 