import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { CommonModule } from 'src/common/common.module';
import { AuthModule } from 'src/auth/auth.module';
import { User, UserImage } from 'src/auth/entities';

@Module({
  imports: [
    CommonModule,
    AuthModule,
    TypeOrmModule.forFeature([User, UserImage]),
  ],
  controllers: [FileController],
  providers: [FileService],
})
export class FileModule {}


