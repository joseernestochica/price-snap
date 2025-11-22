import { Controller, Post, UploadedFiles, Param, Get, Res, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

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
		try {
			const path = this.fileService.getStaticImage( imageName, 'users', id );
			if ( !path ) {
				return res.status( 400 ).json( {
					message: 'Image not found',
					statusCode: 400,
				} );
			}
			res.sendFile( path );
		} catch ( error ) {
			res.status( 400 ).json( {
				message: error instanceof Error ? error.message : 'Error al obtener la imagen',
				statusCode: 400,
			} );
		}
	}

	@Post( 'user/:id' )
	@Auth( ValidRoles.user, ValidRoles.expert, ValidRoles.admin )
	@UploadDirFiles( 'users' )
	uploadUserFile ( @UploadedFiles() files: Array<Express.Multer.File> | Express.Multer.File, @Param( 'id' ) id: string ) {
		// Asegurar que files sea un array
		const filesArray = Array.isArray( files ) ? files : files ? [ files ] : [];
		return this.fileService.insertUserImages( id, filesArray );
	}

	@Delete( 'user/:id' )
	@Auth( ValidRoles.user, ValidRoles.expert, ValidRoles.admin )
	@DeleteDir( 'users' )
	removeUserImages ( @Param( 'id' ) id: string ) {
		return this.fileService.removeUserImages( id );
	}
}


