import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FilesService {
  constructor(private readonly configService: ConfigService) {}

  getStaticProductImages(imageName: string) {
    const path = join(__dirname, '../../static/products', imageName);

    if (!existsSync(path)) {
      throw new BadRequestException(`Image ${imageName} not found`);
    }
    return path;
  }

  //Metodo para construir URL segura
  buildSecureUrl(filename: string): string {
    const hostApi = this.configService.get<string>('HOST_API');
    return `${hostApi}/files/product/${filename}`;
  }
}
