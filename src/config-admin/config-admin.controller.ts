import { Auth } from 'src/auth/decorators';
import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { ValidRoles } from 'src/auth/interfaces';
import { ConfigAdminService } from './config-admin.service';
import { CreateConfigAdminDto, UpdateConfigAdminDto } from './dto';

@Controller( 'config-admin' )
export class ConfigAdminController {
	constructor ( private readonly configAdminService: ConfigAdminService ) { }

	@Post()
	@Auth( ValidRoles.admin )
	create ( @Body() createDto: CreateConfigAdminDto ) {
		return this.configAdminService.create( createDto );
	}

	@Get()
	@Auth( ValidRoles.admin, ValidRoles.user )
	findOne () {
		return this.configAdminService.findOne();
	}

	@Patch()
	@Auth( ValidRoles.admin )
	update ( @Body() updateDto: UpdateConfigAdminDto ) {
		return this.configAdminService.update( updateDto );
	}
}

