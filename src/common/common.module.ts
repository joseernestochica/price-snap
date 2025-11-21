import { ConfigModule } from '@nestjs/config';
import { EncryptService } from './services/encrypt.service';
import { HandleErrorService } from './services/handle-error.service';
import { HttpExternalService } from './services/http-external.service';
import { HttpModule } from '@nestjs/axios';
import { IpWhitelistGuard } from './guards/ip-whitelist.guard';
import { Module } from '@nestjs/common';

@Module( {
	imports: [ ConfigModule, HttpModule ],
	providers: [ HandleErrorService, IpWhitelistGuard, EncryptService, HttpExternalService ],
	exports: [ HandleErrorService, IpWhitelistGuard, EncryptService, HttpExternalService ]
} )
export class CommonModule { }
