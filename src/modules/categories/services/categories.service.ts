import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../domain/category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from '../domain/dto/create-category.dto';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,
    ) { }

    create(createCategoryDto: CreateCategoryDto) {
        const category = this.categoryRepository.create(createCategoryDto);
        if (createCategoryDto.parentId) {
            category.parent = { id: createCategoryDto.parentId } as Category;
        }
        return this.categoryRepository.save(category);
    }

    findAll() {
        return this.categoryRepository.find({
            relations: ['parent', 'children'],
            order: { name: 'ASC' },
        });
    }

    async findOne(id: number) {
        const category = await this.categoryRepository.findOne({
            where: { id },
            relations: ['parent', 'children'],
        });
        if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }
        return category;
    }

    async update(id: number, updateCategoryDto: UpdateCategoryDto) {
        const category = await this.findOne(id);
        this.categoryRepository.merge(category, updateCategoryDto);
        if (updateCategoryDto.parentId) {
            category.parent = { id: updateCategoryDto.parentId } as Category;
        }
        return this.categoryRepository.save(category);
    }

    async remove(id: number) {
        const category = await this.findOne(id);
        return this.categoryRepository.remove(category);
    }
}
