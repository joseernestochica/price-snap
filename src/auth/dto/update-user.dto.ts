import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto extends PartialType( CreateUserDto ) {

	@IsBoolean()
	@IsOptional()
	isTwoFactorEnabled?: boolean;

	@IsString()
	@IsOptional()
	twoFactorSecret?: string;

}
