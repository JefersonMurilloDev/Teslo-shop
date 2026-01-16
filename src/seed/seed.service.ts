import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/products.seed';

@Injectable()
export class SeedService {
  constructor(private readonly productsService: ProductsService) {}
  /**
   * Ejecuta el seed: elimina todos los productos y los recrea.
   */
  async runSeed() {
    // 1. Limpiar la base de datos
    await this.productsService.deleteAllProducts();
    // 2. Insertar productos del seed
    await this.insertNewProducts();
    return { message: 'Seed executed successfully' };
  }
  /**
   * Inserta todos los productos del archivo seed.
   */
  private async insertNewProducts() {
    const products = initialData.products;
    const insertPromises = products.map((product) =>
      this.productsService.create(product),
    );
    await Promise.all(insertPromises);
  }
}
