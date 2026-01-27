import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto, CreateUserDto } from './dto';
import { Auth, GetUser, Public } from './decorators';
import { User } from './entities/user.entity';
import { ValidRoles } from './interfaces/valid-roles';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Public()
  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Get('check-auth-status')
  checkAuthStatus(@GetUser() user: User) {
    return this.authService.checkAuthStatus(user);
  }

  @Get('private')
  testingPrivateRoute(@GetUser() user: User) {
    return {
      ok: true,
      user,
    };
  }

  @Get('private2')
  testingPrivateRoute2(@GetUser('email') email: string) {
    return {
      ok: true,
      email,
    };
  }

  // Nueva ruta de prueba
  @Get('private3')
  @Auth(ValidRoles.user)
  testingPrivateRoute3(@GetUser() user: User) {
    return {
      ok: true,
      user,
    };
  }
}
