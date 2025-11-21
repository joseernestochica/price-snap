import { UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import { fileFilter, fileNamer } from '../helpers';

export function UploadDirFiles(folder: string, maxFiles: number = 10) {
  return UseInterceptors(
    FilesInterceptor('files', maxFiles, {
      fileFilter: fileFilter,
      storage: diskStorage({
        destination: (req, file, callback) => {
          const id = req.params.id;
          const directory = `./static/${folder}/${id}`;

          if (fs.existsSync(directory)) {
            fs.rmSync(directory, { recursive: true });
          }

          fs.mkdirSync(directory, { recursive: true });
          callback(null, directory);
        },
        filename: fileNamer,
      }),
    })
  );
}


