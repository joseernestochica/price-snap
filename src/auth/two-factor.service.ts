import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { GetResponse } from 'src/common/interfaces';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { EncryptService } from 'src/common/services';

@Injectable()
export class TwoFactorService {

	constructor (
		@InjectRepository( User )
		private readonly userRepository: Repository<User>,
		private readonly encryptService: EncryptService
	) { }

	// Genera un secreto y un QR para el usuario
	async generateSecret ( email: string ): Promise<GetResponse<any>> {

		const secret = speakeasy.generateSecret( {
			name: `PriceSnap (${ email })`,
			issuer: 'PriceSnap'
		} );

		const qrCodeUrl = await qrcode.toDataURL( secret.otpauth_url );

		return {
			data: {
				secret: secret.base32,
				qrCode: qrCodeUrl,
				otpauthUrl: secret.otpauth_url

			},
			message: 'Secret generated successfully',
			statusCode: 200
		};

	}

	// Verifica el código 2FA introducido por el usuario
	verifyCode ( encryptedSecret: string, token: string ): boolean {

		const secret = this.encryptService.decrypt( encryptedSecret );

		return speakeasy.totp.verify( {
			secret,
			encoding: 'base32',
			token,
			window: 1
		} );

	}

	// Guarda el secreto en la base de datos y activa el 2FA
	async saveSecret2FA ( userId: string, secret: string ): Promise<void> {

		const encryptedSecret = this.encryptService.encrypt( secret );

		await this.userRepository.update( userId, {
			twoFactorSecret: encryptedSecret,
			isTwoFactorEnabled: true
		} );

	}

	// Desactiva el 2FA para el usuario
	async disable2FA ( userId: string ): Promise<void> {

		await this.userRepository.update( userId, {
			twoFactorSecret: undefined,
			isTwoFactorEnabled: false
		} );

	}

	// Verifica si el usuario tiene 2FA habilitado
	async is2FAEnabled ( userId: string ): Promise<boolean> {

		const user = await this.userRepository.findOne( {
			where: { id: userId },
			select: [ 'isTwoFactorEnabled' ]
		} );

		return user?.isTwoFactorEnabled || false;

	}

	// Genera un código de respaldo
	async generateBackupCodes ( userId: string ): Promise<GetResponse<string[]>> {

		const backupCodes = Array.from( { length: 10 }, () =>
			Math.random().toString( 36 ).substring( 2, 8 ).toUpperCase()
		);

		// Aquí podrías guardar los códigos de respaldo encriptados en la base de datos
		// Por simplicidad, los devolvemos directamente

		return {
			data: backupCodes,
			message: 'Backup codes generated',
			statusCode: 200
		};

	}

}
