import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { join, resolve } from 'path';
import { existsSync } from 'fs';

import { HandleErrorService } from 'src/common/services';
import { GetResponse } from 'src/common/interfaces';
import { User, UserImage } from 'src/auth/entities';

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
		// Usar process.cwd() para que coincida con donde se guardan los archivos (./static/)
		const imagePath = join( process.cwd(), 'static', type, id, imageName );
		const absolutePath = resolve( imagePath );

		if ( !existsSync( absolutePath ) ) {
			const defaultImagePath = resolve( join( process.cwd(), 'static', 'blank.png' ) );
			if ( !existsSync( defaultImagePath ) ) {
				this.handleErrorService.handleBadRequestException( `Image not found: ${ imageName } for user ${ id }` );
				return ''; // This will never be reached due to handleBadRequestException throwing
			}
			return defaultImagePath;
		}

		return absolutePath;
	}

	async insertUserImages ( userId: string, files: Array<Express.Multer.File> ): Promise<GetResponse<any>> {
		if ( !files || files.length === 0 ) {
			this.handleErrorService.handleBadRequestException( 'Images not found' );
			return {} as GetResponse<any>; // This will never be reached due to handleBadRequestException throwing
		}

		const user = await this.userRepository.findOneBy( { id: userId } );
		if ( !user ) {
			this.handleErrorService.handleNotFoundException( `User with id ${ userId } not found` );
			return {} as GetResponse<any>; // This will never be reached due to handleNotFoundException throwing
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
			message: `Imágenes guardadas correctamente (${ savedImages.length } archivos)`,
			data: savedImages.map( ( image ) => ( { url: image.url, id: image.id } ) ),
			statusCode: 200,
		};
	}

	async removeUserImages ( userId: string ) {
		const user = await this.userRepository.findOneBy( { id: userId } );
		if ( !user ) {
			this.handleErrorService.handleBadRequestException( 'User not found' );
			return {} as any; // This will never be reached due to handleBadRequestException throwing
		}

		await this.userImageRepository.delete( { user: { id: userId } } );

		return {
			message: 'Imágenes eliminadas correctamente',
		};
	}
}


