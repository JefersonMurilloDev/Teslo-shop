import { Repository } from 'typeorm';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto/pagination.dto';
import { isUUID } from 'class-validator';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  private normalizeTags(tags?: string[]) {
    return tags?.map((tag) => tag.toLowerCase().trim());
  }

  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productsRepository.create({
        ...createProductDto,
        tags: this.normalizeTags(createProductDto.tags),
      });
      await this.productsRepository.save(product);

      console.log(product);
      return product;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    const [results, total] = await this.productsRepository.findAndCount({
      take: limit,
      skip: offset,
    });
    return { total, limit, offset, results };
  }

  async findOne(term: string) {
    let product: Product | null = null;
    if (isUUID(term)) {
      product = await this.productsRepository.findOneBy({ id: term });
    } else {
      const query = this.productsRepository.createQueryBuilder();
      product = await query
        .where('title ILIKE :term OR slug ILIKE :term', {
          term: `%${term}%`,
        })
        .getOne();
    }
    this.validProduct(product, term);
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productsRepository.preload({
      id,
      ...updateProductDto,
      tags: this.normalizeTags(updateProductDto.tags),
    });
    this.validProduct(product, id);
    try {
      return await this.productsRepository.save(product);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
    return { message: 'Product deleted', id };
  }

  /**
   * Valida que el producto exista.
   * Lanza NotFoundException si no existe.
   */
  private validProduct(
    product: Product | null | undefined,
    id: string,
  ): asserts product is Product {
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
  }

  private handleDBExceptions(error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const err = error as { code?: string; detail?: string };
      if (err.code === '23505') {
        throw new BadRequestException(err.detail);
      }
    }
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
