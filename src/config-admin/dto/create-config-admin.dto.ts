import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class CreateConfigAdminDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength( 255 )
  companyName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength( 64 )
  cifNif: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength( 32 )
  phone: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength( 255 )
  address: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength( 16 )
  postalCode: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength( 128 )
  country: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength( 128 )
  province: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength( 128 )
  city: string;

  @IsEmail()
  @MaxLength( 255 )
  email: string;

  @IsString()
  @IsOptional()
  @Length( 3, 3 )
  currencyIso?: string;

	@IsString()
	@IsOptional()
	@MaxLength( 255 )
	googleId?: string | null;
}

