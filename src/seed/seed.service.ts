import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/products.seed';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SeedService {
  constructor(
    private readonly productsService: ProductsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  /**
   * Ejecuta el seed: elimina todos los productos y los recrea.
   */
  async runSeed() {
    // 1. Limpiar la base de datos
    await this.deleteTables();
    // 2. Insertar productos and users del seed
    const adminUser = await this.insertUsers();
    await this.insertNewProducts(adminUser);
    return { message: 'Seed executed successfully' };
  }

  // Insertar productos and usuarios en la base de datos
  private async insertUsers() {
    const seedUsers = initialData.users;

    const users: User[] = [];

    seedUsers.forEach((user) => {
      users.push(this.userRepository.create(user));
    });

    const dbUsers = await this.userRepository.save(seedUsers);
    return dbUsers[0];
  }

  //Borrar Tablas de base de datos
  private async deleteTables() {
    await this.productsService.deleteAllProducts();
    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder.delete().where({}).execute();
  }
  /**
   * Inserta todos los productos del archivo seed.
   */
  private async insertNewProducts(user: User) {
    const products = initialData.products;
    const insertPromises = products.map((product) =>
      this.productsService.create(product, user),
    );
    await Promise.all(insertPromises);
  }
}
