import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto, CreateUserDto } from './dto';
import { Auth, GetUser, Public } from './decorators';
import { User } from './entities/user.entity';
import { ValidRoles } from './interfaces/valid-roles';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Public()
  @Post('register')
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data or duplicate email',
  })
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Get('check-auth-status')
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Token renewed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or expired token' })
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
