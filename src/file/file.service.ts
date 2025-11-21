import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { join } from 'path';
import { existsSync } from 'fs';

import { HandleErrorService } from 'src/common/services';
import { GetResponse } from 'src/common/interfaces';
import { User, UserImage } from 'src/auth/entities';
import type { Express } from 'express';

@Injectable()
export class FileService {

	constructor (
		private readonly handleErrorService: HandleErrorService,
		@InjectRepository( User )
		private readonly userRepository: Repository<User>,
		@InjectRepository( UserImage )
		private readonly userImageRepository: Repository<UserImage>,
	) { }

	getStaticImage ( imageName: string, type: string, id: string ): string {
		const path = join( __dirname, '..', '..', 'static', type, id, imageName );

		if ( !existsSync( path ) ) {
			const defaultImagePath = join( __dirname, '..', '..', 'static', 'blank.png' );
			if ( !existsSync( defaultImagePath ) ) {
				throw new BadRequestException( 'Image not found and default image not available' );
			}
			return defaultImagePath;
		}

		return path;
	}

	async insertUserImages ( userId: string, files: Array<Express.Multer.File> ): Promise<GetResponse<any>> {
		if ( !files || files.length === 0 ) {
			this.handleErrorService.handleBadRequestException( 'Images not found' );
		}

		const user = await this.userRepository.findOneBy( { id: userId } );
		if ( !user ) {
			this.handleErrorService.handleNotFoundException( `User with id ${ userId } not found` );
		}

		await this.userImageRepository.delete( { user: { id: userId } } );

		const newImages = files.map( ( file ) => {
			const userImage = new UserImage();
			userImage.url = file.filename;
			userImage.user = user!;
			return userImage;
		} );

		const savedImages = await this.userImageRepository.save( newImages );

		user!.images = savedImages as any;
		await this.userRepository.save( user! );

		return {
			message: 'Imágenes guardadas correctamente',
			data: savedImages.map( ( image ) => ( { url: image.url, id: image.id } ) ),
			statusCode: 200,
		};
	}

	async removeUserImages ( userId: string ) {
		const user = await this.userRepository.findOneBy( { id: userId } );
		if ( !user ) {
			this.handleErrorService.handleBadRequestException( 'User not found' );
		}

		await this.userImageRepository.delete( { user: { id: userId } } );

		return {
			message: 'Imágenes eliminadas correctamente',
		};
	}
}


