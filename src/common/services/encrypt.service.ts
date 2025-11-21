import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EncryptService {
	private readonly algorithm = 'aes-256-cbc';
	private readonly key: Buffer;

	constructor () {
		const keyHex = process.env.ENCRYPT_KEY;

		if ( !keyHex || keyHex.length !== 64 ) {
			throw new Error( 'La clave de cifrado debe estar definida en ENCRYPT_KEY y tener 32 bytes (64 hex).' );
		}

		this.key = Buffer.from( keyHex, 'hex' );
	}

	encrypt ( text: string ): string {
		const iv = crypto.randomBytes( 16 );
		const cipher = crypto.createCipheriv( this.algorithm, this.key, iv );
		let encrypted = cipher.update( text, 'utf8', 'hex' );
		encrypted += cipher.final( 'hex' );
		return iv.toString( 'hex' ) + ':' + encrypted;
	}

	decrypt ( encrypted: string ): string {
		const [ ivHex, encryptedText ] = encrypted.split( ':' );
		const iv = Buffer.from( ivHex, 'hex' );
		const decipher = crypto.createDecipheriv( this.algorithm, this.key, iv );
		let decrypted = decipher.update( encryptedText, 'hex', 'utf8' );
		decrypted += decipher.final( 'utf8' );
		return decrypted;
	}
}






