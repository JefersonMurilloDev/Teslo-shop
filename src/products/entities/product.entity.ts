import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductImage } from './product-image.entity';
import { Transform } from 'class-transformer';

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {
    unique: true,
  })
  title: string;

  @Column({
    type: 'float',
    default: 0,
  })
  price: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column({
    type: 'text',
    unique: true,
  })
  slug: string;

  @Column({
    type: 'int',
    default: 0,
  })
  stock: number;

  @Column({
    type: 'text',
    array: true,
  })
  sizes: string[];

  @Column('text')
  gender: string;

  @Column('text', {
    array: true,
    default: [],
  })
  tags: string[];
  //images
  @OneToMany(() => ProductImage, (productImage) => productImage.product, {
    cascade: true,
    eager: true,
  })
  @Transform(
    ({ value }: { value?: ProductImage[] }) =>
      value?.map((img) => img.url) ?? [],
  )
  images?: ProductImage[];

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
