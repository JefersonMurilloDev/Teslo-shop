import { DataSource, Repository } from 'typeorm';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto/pagination.dto';
import { Product, ProductImage } from './entities';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  private normalizeTags(tags?: string[]) {
    return tags?.map((tag) => tag.toLowerCase().trim());
  }

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImagesRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto, user: User) {
    try {
      const { images = [], ...productDetails } = createProductDto;

      const product = this.productRepository.create({
        ...productDetails,
        tags: this.normalizeTags(createProductDto.tags),
        images: images.map((url) =>
          this.productImagesRepository.create({ url }),
        ),
        user: user,
      });
      await this.productRepository.save(product);

      return { ...product, images };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    const [results, total] = await this.productRepository.findAndCount({
      take: limit,
      skip: offset,
      relations: {
        images: true,
      },
    });
    return {
      total,
      limit,
      offset,
      results,
    };
  }

  async findOne(term: string) {
    let product: Product | null = null;
    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      const query = this.productRepository.createQueryBuilder('product');
      product = await query
        .leftJoinAndSelect('product.images', 'images')
        .where('title ILIKE :term OR slug ILIKE :term', {
          term: `%${term}%`,
        })
        .getOne();
    }
    this.validProduct(product, term);
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    const { images, ...toUpdate } = updateProductDto;
    const product = await this.productRepository.preload({
      id,
      ...toUpdate,
      tags: this.normalizeTags(toUpdate.tags),
    });
    this.validProduct(product, id);
    // Crear QueryRunner para transacción
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // Si vienen imágenes nuevas, eliminar las anteriores
      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } });
        // Crear las nuevas imágenes
        product.images = images.map((url) =>
          this.productImagesRepository.create({ url }),
        );
      }
      // Guardar el producto actualizado
      product.user = user;
      await queryRunner.manager.save(product);
      // Confirmar transacción
      await queryRunner.commitTransaction();
      return this.findOne(id);
    } catch (error) {
      // Revertir cambios si algo falla
      await queryRunner.rollbackTransaction();
      this.handleDBExceptions(error);
    } finally {
      // SIEMPRE liberar el queryRunner
      await queryRunner.release();
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
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

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');

    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
}
