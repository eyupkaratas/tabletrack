import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Kullanıcıyı doğrula
    const user = await this.authService.validateUser(body.email, body.password);

    //Token üret
    const token = await this.authService.login(user);

    //Cookie set et
    res.cookie('token', token.access_token, {
      httpOnly: true,
      secure: false, // prod’da true (HTTPS)
      sameSite: 'lax',
      path: '/',
      maxAge: 1000 * 60 * 60, // 1 saat
    });

    return { message: 'Login successful' };
  }
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req) {
    return this.authService.getProfile(req.user.sub);
  }
}
