import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  student_number: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
