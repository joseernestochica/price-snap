import { IsString, IsEmail, IsNotEmpty, MinLength, MaxLength, Matches, IsOptional } from 'class-validator';

export class LoginUserDto {

	@IsEmail()
	@IsNotEmpty()
	readonly email: string;

	@IsString()
	@MinLength( 6 )
	@MaxLength( 100 )
	readonly password: string;

	@IsString()
	@IsOptional()
	readonly token2fa?: string;

}
