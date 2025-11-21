import { Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SeedService } from './seed.service';
import { Auth } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';

@ApiTags( 'Seed' )
@Controller( 'seed' )
export class SeedController {
	constructor ( private readonly seedService: SeedService ) { }

	@Post( 'users' )
	@Auth( ValidRoles.admin )
	async seedUsers () {
		return await this.seedService.seedUsersFromData();
	}
}


