import { PartialType } from '@nestjs/swagger';
import { IsUUID } from "class-validator";
import { CreateRefreshTokenDto } from './create-refresh-token.dto';


export class UpdateRefreshTokenDto extends PartialType( CreateRefreshTokenDto ) {

	@IsUUID()
	refreshToken: string;

}
