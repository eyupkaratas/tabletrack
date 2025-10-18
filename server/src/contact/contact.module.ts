import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';

@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const port = Number(config.get('SMTP_PORT') ?? '0');
        const secure =
          config.get('SMTP_SECURE') === 'true' || Number(port) === 465;

        return {
          transport: {
            host: config.get<string>('SMTP_HOST'),
            port,
            secure,
            auth: {
              user: config.get<string>('SMTP_USER'),
              pass: config.get<string>('SMTP_PASS'),
            },
          },
          defaults: {
            from:
              config.get<string>('SMTP_FROM') ??
              config.get<string>('SMTP_USER'),
          },
        };
      },
    }),
  ],
  controllers: [ContactController],
  providers: [ContactService],
})
export class ContactModule {}

