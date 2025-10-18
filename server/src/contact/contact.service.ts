import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class ContactService {
  constructor(private readonly mailerService: MailerService) {}

  async sendMail(name: string, email: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: 'contact@eyupkaratas.dev',
        from: '"TableTrack" <contact@eyupkaratas.dev>',
        subject: 'TableTrack Info Request',
        html: [
          '<div style="font-family: Arial, sans-serif; color: #111827;">',
          '<h2>New TableTrack access request</h2>',
          '<p>A visitor asked to hear more about TableTrack.</p>',
          `<p><strong>Name:</strong> ${name}</p>`,
          `<p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>`,
          '<p style="margin-top: 24px; font-size: 12px; color: #6b7280;">This email was generated automatically from the landing page form.</p>',
          '</div>',
        ].join(''),
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Could not forward the contact request',
        { cause: error },
      );
    }
  }
}
