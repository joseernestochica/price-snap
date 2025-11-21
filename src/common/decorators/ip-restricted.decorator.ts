import { applyDecorators, UseGuards } from '@nestjs/common';
import { IpWhitelistGuard } from '../guards/ip-whitelist.guard';

export function IpRestricted () {
	return applyDecorators(
		UseGuards( IpWhitelistGuard )
	);
}






