import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Public()
  @Post('login')
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Validate user credentials
    const user = await this.authService.validateUser(body.email, body.password);

    // Create JWT token
    const token = await this.authService.login(user);

    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('token', token.access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      domain: isProduction ? '.eyupkaratas.dev' : undefined,
      path: '/',
      maxAge: 8 * 60 * 60 * 1000, // 8 hours
    });

    return { message: 'Login successful' };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token');
    return { message: 'Logged out successfully' };
  }
  @Get('me')
  async getProfile(@Req() req) {
    return this.authService.getProfile(req.user.sub);
  }
}
