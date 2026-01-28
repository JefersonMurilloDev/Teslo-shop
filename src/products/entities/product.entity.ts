import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { ProductImage } from './product-image.entity';
import { Transform } from 'class-transformer';
import { User } from 'src/auth/entities/user.entity';

@Entity({ name: 'products' })
export class Product {
  @ApiProperty({
    example: 'cd533345-f1f3-48c9-a62e-7dc2da50c8f8',
    description: 'Product ID',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'T-Shirt Teslo',
    description: 'Product title',
    uniqueItems: true,
  })
  @Column('text', {
    unique: true,
  })
  title: string;

  @ApiProperty({
    example: 99.99,
    description: 'Product price',
  })
  @Column({
    type: 'float',
    default: 0,
  })
  price: number;

  @ApiProperty({
    example: 'Comfortable cotton t-shirt',
    description: 'Product description',
    nullable: true,
  })
  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @ApiProperty({
    example: 't_shirt_teslo',
    description: 'Product slug for SEO',
    uniqueItems: true,
  })
  @Column({
    type: 'text',
    unique: true,
  })
  slug: string;

  @ApiProperty({
    example: 100,
    description: 'Product stock',
    default: 0,
  })
  @Column({
    type: 'int',
    default: 0,
  })
  stock: number;

  @ApiProperty({
    example: ['S', 'M', 'L', 'XL'],
    description: 'Product sizes',
  })
  @Column({
    type: 'text',
    array: true,
  })
  sizes: string[];

  @ApiProperty({
    example: 'men',
    description: 'Product gender',
    enum: ['men', 'women', 'kid', 'unisex'],
  })
  @Column('text')
  gender: string;

  @ApiProperty({
    example: ['shirt', 'summer'],
    description: 'Product tags',
  })
  @Column('text', {
    array: true,
    default: [],
  })
  tags: string[];

  @OneToMany(() => ProductImage, (productImage) => productImage.product, {
    cascade: true,
    eager: true,
  })
  @Transform(
    ({ value }: { value?: ProductImage[] }) =>
      value?.map((img) => img.url) ?? [],
  )
  images?: ProductImage[];

  //user
  @ManyToOne(() => User, (user) => user.products, { eager: true })
  user: User;

  private normalizeSlug() {
    if (!this.slug) {
      this.slug = this.title;
    }
    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }

  @BeforeInsert()
  checkSlugInsert() {
    this.normalizeSlug();
  }

  @BeforeUpdate()
  checkSlugUpdate() {
    this.normalizeSlug();
  }
}
