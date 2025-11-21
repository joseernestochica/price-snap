export interface JwtPayload {
	id: string;
	email: string;
	fullName: string;
	role: string;
	isTwoFactorEnabled: boolean;
}

export enum ValidRoles {
	admin = 'admin',
	superUser = 'super-user',
	user = 'user',
	expert = 'expert',
}
