import { IsString, IsEmail, IsNotEmpty, MinLength, MaxLength, Matches, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { ValidRoles } from '../interfaces';

export class CreateUserDto {

	@IsEmail()
	@IsNotEmpty()
	readonly email: string;

	@IsString()
	@MinLength( 6 )
	@MaxLength( 100 )
	@Matches(
		/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
		message: 'password_invalid'
	} )
	password: string;

	@IsString()
	@IsNotEmpty()
	readonly fullName: string;

	@IsString()
	@IsOptional()
	readonly phone?: string;

	@IsString()
	@IsOptional()
	readonly address?: string;

	@IsString()
	@IsOptional()
	readonly postalCode?: string;

	@IsString()
	@IsOptional()
	readonly city?: string;

	@IsString()
	@IsOptional()
	readonly province?: string;

	@IsString()
	@IsOptional()
	readonly country?: string;

	@IsString()
	@IsOptional()
	readonly nif?: string;

	@IsBoolean()
	@IsOptional()
	readonly isActive?: boolean;

	@IsEnum( ValidRoles, { each: true } )
	@IsOptional()
	readonly roles?: ValidRoles[];

}
