import { Body, Controller, Post } from '@nestjs/common';
import { Public } from 'src/auth/public.decorator';
import { CreateContactDto } from './dto/create-contact.dto';
import { ContactService } from './contact.service';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Public()
  @Post()
  async sendMessage(
    @Body() body: CreateContactDto,
  ): Promise<{ message: string }> {
    await this.contactService.sendMail(body.name, body.email);
    return { message: 'Email sent successfully' };
  }
}
