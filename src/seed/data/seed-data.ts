import { ValidRoles } from 'src/auth/interfaces';

export interface SeedUser {
	email: string;
	password: string;
	fullName: string;
	phone?: string;
	address?: string;
	postalCode?: string;
	city?: string;
	province?: string;
	country?: string;
	nif?: string;
	isActive?: boolean;
	roles?: ValidRoles[];
}

export const USERS_SEED: SeedUser[] = [
	{ email: 'user1@example.com', password: 'Password1!', fullName: 'Usuario 1', phone: '600000001', address: 'Calle Uno 1', postalCode: '28001', city: 'madrid', province: '28', country: 'ES', nif: '00000001A', isActive: true, roles: [ ValidRoles.user ] },
	{ email: 'user2@example.com', password: 'Password1!', fullName: 'Usuario 2', phone: '600000002', address: 'Calle Dos 2', postalCode: '08002', city: 'barcelona', province: '08', country: 'ES', nif: '00000002B', isActive: true, roles: [ ValidRoles.user ] },
	{ email: 'user3@example.com', password: 'Password1!', fullName: 'Usuario 3', phone: '600000003', address: 'Avenida Tres 3', postalCode: '41003', city: 'sevilla', province: '41', country: 'ES', nif: '00000003C', isActive: true, roles: [ ValidRoles.user ] },
	{ email: 'user4@example.com', password: 'Password1!', fullName: 'Usuario 4', phone: '600000004', address: 'Calle Cuatro 4', postalCode: '46004', city: 'valencia', province: '46', country: 'ES', nif: '00000004D', isActive: true, roles: [ ValidRoles.user ] },
	{ email: 'user5@example.com', password: 'Password1!', fullName: 'Usuario 5', phone: '600000005', address: 'Plaza Cinco 5', postalCode: '50005', city: 'zaragoza', province: '50', country: 'ES', nif: '00000005E', isActive: true, roles: [ ValidRoles.user ] },
	{ email: 'user6@example.com', password: 'Password1!', fullName: 'Usuario 6', phone: '600000006', address: 'Calle Seis 6', postalCode: '29006', city: 'malaga', province: '29', country: 'ES', nif: '00000006F', isActive: true, roles: [ ValidRoles.user ] },
	{ email: 'user7@example.com', password: 'Password1!', fullName: 'Usuario 7', phone: '600000007', address: 'Avenida Siete 7', postalCode: '35007', city: 'las-palmas', province: '35', country: 'ES', nif: '00000007G', isActive: true, roles: [ ValidRoles.user ] },
	{ email: 'user8@example.com', password: 'Password1!', fullName: 'Usuario 8', phone: '600000008', address: 'Calle Ocho 8', postalCode: '15008', city: 'a-coruna', province: '15', country: 'ES', nif: '00000008H', isActive: true, roles: [ ValidRoles.user ] },
	{ email: 'user9@example.com', password: 'Password1!', fullName: 'Usuario 9', phone: '600000009', address: 'Calle Nueve 9', postalCode: '24009', city: 'leon', province: '24', country: 'ES', nif: '00000009J', isActive: true, roles: [ ValidRoles.user ] },
	{ email: 'user10@example.com', password: 'Password1!', fullName: 'Usuario 10', phone: '600000010', address: 'Calle Diez 10', postalCode: '20010', city: 'san-sebastian', province: '20', country: 'ES', nif: '00000010K', isActive: true, roles: [ ValidRoles.user ] },
	{ email: 'user11@example.com', password: 'Password1!', fullName: 'Usuario 11', phone: '600000011', address: 'Calle Once 11', postalCode: '33011', city: 'oviedo', province: '33', country: 'ES', nif: '00000011L', isActive: true, roles: [ ValidRoles.user ] },
	{ email: 'user12@example.com', password: 'Password1!', fullName: 'Usuario 12', phone: '600000012', address: 'Calle Doce 12', postalCode: '15012', city: 'a-coruna', province: '15', country: 'ES', nif: '00000012M', isActive: true, roles: [ ValidRoles.user ] },
	{ email: 'user13@example.com', password: 'Password1!', fullName: 'Usuario 13', phone: '600000013', address: 'Calle Trece 13', postalCode: '31013', city: 'pamplona', province: '31', country: 'ES', nif: '00000013N', isActive: true, roles: [ ValidRoles.user ] },
	{ email: 'user14@example.com', password: 'Password1!', fullName: 'Usuario 14', phone: '600000014', address: 'Calle Catorce 14', postalCode: '15014', city: 'a-coruna', province: '15', country: 'ES', nif: '00000014P', isActive: true, roles: [ ValidRoles.user ] },
	{ email: 'user15@example.com', password: 'Password1!', fullName: 'Usuario 15', phone: '600000015', address: 'Calle Quince 15', postalCode: '41015', city: 'sevilla', province: '41', country: 'ES', nif: '00000015Q', isActive: true, roles: [ ValidRoles.user ] },
	{ email: 'user16@example.com', password: 'Password1!', fullName: 'Usuario 16', phone: '600000016', address: 'Calle Dieciséis 16', postalCode: '46016', city: 'valencia', province: '46', country: 'ES', nif: '00000016R', isActive: true, roles: [ ValidRoles.user ] },
	{ email: 'user17@example.com', password: 'Password1!', fullName: 'Usuario 17', phone: '600000017', address: 'Calle Diecisiete 17', postalCode: '50017', city: 'zaragoza', province: '50', country: 'ES', nif: '00000017S', isActive: true, roles: [ ValidRoles.user ] },
	{ email: 'user18@example.com', password: 'Password1!', fullName: 'Usuario 18', phone: '600000018', address: 'Calle Dieciocho 18', postalCode: '29018', city: 'malaga', province: '29', country: 'ES', nif: '00000018T', isActive: true, roles: [ ValidRoles.user ] },
	{ email: 'user19@example.com', password: 'Password1!', fullName: 'Usuario 19', phone: '600000019', address: 'Calle Diecinueve 19', postalCode: '35019', city: 'las-palmas', province: '35', country: 'ES', nif: '00000019V', isActive: true, roles: [ ValidRoles.user ] },
	{ email: 'user20@example.com', password: 'Password1!', fullName: 'Usuario 20', phone: '600000020', address: 'Calle Veinte 20', postalCode: '20020', city: 'san-sebastian', province: '20', country: 'ES', nif: '00000020W', isActive: true, roles: [ ValidRoles.user ] },
	{ email: 'user21@example.com', password: 'Password1!', fullName: 'Usuario 21', phone: '600000021', address: 'Calle Veintiuno 21', postalCode: '28021', city: 'madrid', province: '28', country: 'ES', nif: '00000021X', isActive: true, roles: [ ValidRoles.user ] },
	{ email: 'user22@example.com', password: 'Password1!', fullName: 'Usuario 22', phone: '600000022', address: 'Calle Veintidós 22', postalCode: '08022', city: 'barcelona', province: '08', country: 'ES', nif: '00000022Y', isActive: true, roles: [ ValidRoles.user ] },
	{ email: 'user23@example.com', password: 'Password1!', fullName: 'Usuario 23', phone: '600000023', address: 'Calle Veintitrés 23', postalCode: '41023', city: 'sevilla', province: '41', country: 'ES', nif: '00000023Z', isActive: true, roles: [ ValidRoles.user ] },
	{ email: 'user24@example.com', password: 'Password1!', fullName: 'Usuario 24', phone: '600000024', address: 'Calle Veinticuatro 24', postalCode: '46024', city: 'valencia', province: '46', country: 'ES', nif: '00000024A', isActive: true, roles: [ ValidRoles.user ] },
	{ email: 'user25@example.com', password: 'Password1!', fullName: 'Usuario 25', phone: '600000025', address: 'Calle Veinticinco 25', postalCode: '50025', city: 'zaragoza', province: '50', country: 'ES', nif: '00000025B', isActive: true, roles: [ ValidRoles.user ] },
	{ email: 'user26@example.com', password: 'Password1!', fullName: 'Usuario 26', phone: '600000026', address: 'Calle Veintiséis 26', postalCode: '29026', city: 'malaga', province: '29', country: 'ES', nif: '00000026C', isActive: true, roles: [ ValidRoles.user ] },
	{ email: 'user27@example.com', password: 'Password1!', fullName: 'Usuario 27', phone: '600000027', address: 'Calle Veintisiete 27', postalCode: '35027', city: 'las-palmas', province: '35', country: 'ES', nif: '00000027D', isActive: true, roles: [ ValidRoles.user ] },
	{ email: 'user28@example.com', password: 'Password1!', fullName: 'Usuario 28', phone: '600000028', address: 'Calle Veintiocho 28', postalCode: '20028', city: 'san-sebastian', province: '20', country: 'ES', nif: '00000028E', isActive: true, roles: [ ValidRoles.user ] },
	{ email: 'user29@example.com', password: 'Password1!', fullName: 'Usuario 29', phone: '600000029', address: 'Calle Veintinueve 29', postalCode: '28029', city: 'madrid', province: '28', country: 'ES', nif: '00000029F', isActive: true, roles: [ ValidRoles.user ] },
	{ email: 'user30@example.com', password: 'Password1!', fullName: 'Usuario 30', phone: '600000030', address: 'Calle Treinta 30', postalCode: '08030', city: 'barcelona', province: '08', country: 'ES', nif: '00000030G', isActive: true, roles: [ ValidRoles.user ] },
];


