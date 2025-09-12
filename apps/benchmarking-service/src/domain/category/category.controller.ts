import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';
import { CategoryService } from './category.service';

@Controller()
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @MessagePattern('create_category')
  async createCategory(@Payload() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.createCategory(createCategoryDto);
  }

  @MessagePattern('get_categories')
  async getCategories() {
    return this.categoryService.getCategories();
  }

  @MessagePattern('create_subcategory')
  async createSubcategory(@Payload() createSubCategoryDto: CreateSubCategoryDto) {
    return this.categoryService.createSubcategory(createSubCategoryDto);
  }

  @MessagePattern('get_subcategories')
  async getSubcategories(@Payload() categoryId: string) {
    return this.categoryService.getSubcategories(categoryId);
  }
} 