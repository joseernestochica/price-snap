import { Request } from 'express';

export const fileFilter = ( req: Request, file: Express.Multer.File, callback: Function ) => {
  if ( !file ) {
    return callback( new Error( 'File is empty' ), false );
  }

  const allowedMimeTypes = [ 'image/jpeg', 'image/png', 'image/jpg', 'image/webp' ];
  if ( !allowedMimeTypes.includes( file.mimetype.toLowerCase() ) ) {
    return callback( new Error( `File type ${ file.mimetype } is not allowed. Allowed types: ${ allowedMimeTypes.join( ', ' ) }` ), false );
  }

  callback( null, true );
};


