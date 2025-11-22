import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HandleErrorService } from 'src/common/services';
import { GetResponse } from 'src/common/interfaces';
import { ConfigAdmin } from './entities';
import { CreateConfigAdminDto, UpdateConfigAdminDto } from './dto';

@Injectable()
export class ConfigAdminService {
	constructor (
		@InjectRepository( ConfigAdmin )
		private readonly configAdminRepository: Repository<ConfigAdmin>,
		private readonly handleErrorService: HandleErrorService,
	) { }

	async create ( createDto: CreateConfigAdminDto ): Promise<GetResponse<ConfigAdmin>> {
		try {

			const exists = await this.configAdminRepository.count();
			if ( exists > 0 ) {
				this.handleErrorService.handleBadRequestException( 'Ya existe una configuración. Use actualización.' );
				return {} as GetResponse<ConfigAdmin>; // This will never be reached due to handleBadRequestException throwing
			}

			const entity = this.configAdminRepository.create( {
				...createDto,
				currencyIso: createDto.currencyIso ?? 'EUR',
				googleId: createDto.googleId ?? null,
			} );

			const saved = await this.configAdminRepository.save( entity );

			return { data: saved, message: 'Configuración creada', statusCode: 201 };

		} catch ( error ) {
			this.handleErrorService.handleDBException( error );
			return {} as GetResponse<ConfigAdmin>; // This will never be reached due to handleDBException throwing
		}
	}

	async findOne (): Promise<GetResponse<ConfigAdmin | null>> {

		const [ entity ] = await this.configAdminRepository.find( { take: 1 } );

		return {
			data: entity || null,
			message: entity ? 'Configuración encontrada' : 'No hay configuración',
			statusCode: 200,
		};

	}

	async update ( updateDto: UpdateConfigAdminDto ): Promise<GetResponse<ConfigAdmin>> {
		try {

			const [ current ] = await this.configAdminRepository.find( { take: 1 } );

			if ( !current ) {
				const created = this.configAdminRepository.create( {
					...updateDto,
					currencyIso: updateDto.currencyIso ?? 'EUR',
					googleId: updateDto.googleId ?? null,
				} as CreateConfigAdminDto );

				const savedCreated = await this.configAdminRepository.save( created );
				return { data: savedCreated, message: 'Configuración creada', statusCode: 201 };
			}

			const merged = this.configAdminRepository.merge( current, updateDto );
			const saved = await this.configAdminRepository.save( merged );

			return { data: saved, message: 'Configuración actualizada', statusCode: 200 };

		} catch ( error ) {
			this.handleErrorService.handleDBException( error );
			return {} as GetResponse<ConfigAdmin>; // This will never be reached due to handleDBException throwing
		}
	}
}

