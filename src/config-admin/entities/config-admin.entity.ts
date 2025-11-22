import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity( { name: 'config_admin' } )
export class ConfigAdmin {
	@PrimaryGeneratedColumn( 'uuid' )
	id: string;

	@Column( { type: 'varchar', length: 255 } )
	companyName: string;

	@Column( { type: 'varchar', length: 64 } )
	cifNif: string;

	@Column( { type: 'varchar', length: 32 } )
	phone: string;

	@Column( { type: 'varchar', length: 255 } )
	address: string;

	@Column( { type: 'varchar', length: 16 } )
	postalCode: string;

	@Column( { type: 'varchar', length: 128 } )
	country: string;

	@Column( { type: 'varchar', length: 128 } )
	province: string;

	@Column( { type: 'varchar', length: 128 } )
	city: string;

	@Column( { type: 'varchar', length: 255 } )
	email: string;

	@Column( { type: 'varchar', length: 3, default: 'EUR' } )
	currencyIso: string;

	@Column( { type: 'varchar', length: 255, nullable: true } )
	googleId: string | null;
}

