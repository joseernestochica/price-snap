import { IsArray, IsString, IsOptional } from 'class-validator';

export class GetByIdsDto {

	@IsArray()
	@IsString( { each: true } )
	ids: string[];

	@IsString()
	@IsOptional()
	select?: string;

}






