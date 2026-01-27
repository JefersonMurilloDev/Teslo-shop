import { Controller, Get } from '@nestjs/common';
import { SeedService } from './seed.service';
import { Auth, Public } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces/valid-roles';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Public()
  @Get()
  //@Auth(ValidRoles.admin)
  executeSeed() {
    return this.seedService.runSeed();
  }
}
