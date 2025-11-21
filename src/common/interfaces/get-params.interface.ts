export interface GetParams {
	page?: number;
	limit?: number;
	where?: WhereParams;
	sort?: SortParams;
	select?: string[];
	search?: string;
	andWhere?: AndWhereParams[];
	orWhere?: AndWhereParams[];
	relations?: string[];
	rawAndWhere?: RawWhereParams[];
	relationOrders?: RelationOrderParams[]; // Ordenaciones para relaciones unidas
	/** Joins adicionales para rutas anidadas, ej: 'sourceTags.sourceTag' */
	extraJoins?: ExtraJoinParams[];
}

export interface WhereParams {
	query: string
	params?: any;
}

export interface SortParams {
	column: string,
	direction: string,
}

export interface AndWhereParams {
	field: string,
	value: any,
	isEnum?: boolean; // Indica si el campo es un tipo enum
}

export interface RawWhereParams {
	query: string,
	params?: any
}

export interface RelationOrderParams {
	relation: string; // alias de la relación tal como se añade en el join
	column: string;   // columna dentro de la relación
	direction?: 'ASC' | 'DESC';
}

export interface ExtraJoinParams {
	path: string; // ruta completa desde el alias principal, p.ej. "sourceTags.sourceTag"
	alias: string; // alias a asignar al join, p.ej. "sourceTag"
}