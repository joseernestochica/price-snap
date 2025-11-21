import { Controller, Post, UploadedFiles, Param, Get, Res, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response, Express } from 'express';

import { FileService } from './file.service';
import { Auth } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';
import { UploadDirFiles } from './decorators';
import { DeleteDir } from './decorators/delete-dir.decorator';

@ApiTags( 'Files - Get and Upload' )
@Controller( 'file' )
export class FileController {

	constructor (
		private readonly fileService: FileService,
	) { }

	@Get( 'user/:imageName/:id' )
	getImageUser (
		@Res() res: Response,
		@Param( 'imageName' ) imageName: string,
		@Param( 'id' ) id: string,
	) {
		const path = this.fileService.getStaticImage( imageName, 'users', id );
		res.sendFile( path );
	}

	@Post( 'user/:id' )
	@Auth( ValidRoles.user, ValidRoles.expert, ValidRoles.admin )
	@UploadDirFiles( 'users' )
	uploadUserFile ( @UploadedFiles() files: Array<Express.Multer.File>, @Param( 'id' ) id: string ) {
		return this.fileService.insertUserImages( id, files );
	}

	@Delete( 'user/:id' )
	@Auth( ValidRoles.user, ValidRoles.expert, ValidRoles.admin )
	@DeleteDir( 'users' )
	removeUserImages ( @Param( 'id' ) id: string ) {
		return this.fileService.removeUserImages( id );
	}
}


