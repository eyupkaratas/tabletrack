import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateContactDto {
  @IsNotEmpty({ message: 'name is required' })
  @MaxLength(120)
  name!: string;

  @IsNotEmpty({ message: 'email is required' })
  @IsEmail()
  @MaxLength(255)
  email!: string;
}

