export class Utils {

	static capitalize ( word: string ): string {

		if ( word && word.length > 0 ) return word.replace( /(^|\s)\S/g, l => l.toUpperCase() );
		return '';

	}

	static formatUrlString ( query: string | undefined ): string {

		if ( !query ) { return ''; }

		const newQuery: string = query
			.normalize( 'NFD' )
			.replace( /[\u0300-\u036f]/g, '' )
			.normalize();

		return newQuery.replace( /[^A-Z0-9_|]/ig, "-" ).toLowerCase();

	}

	static isValidUUID ( uuid: string ): boolean {

		if ( !uuid ) return false;

		const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
		return uuidRegex.test( uuid );

	}

}






