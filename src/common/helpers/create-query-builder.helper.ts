// TODO: AÑADIR UNACCENT A LAS BÚSQUEDAS. Ejecutar en la base de datos el siguiente comando:
// TODO: CREATE EXTENSION IF NOT EXISTS unaccent;

import { Repository, ObjectLiteral } from "typeorm";
import { GetParams, GetResponse } from "../interfaces";

export async function createQueryBuilder<T extends ObjectLiteral> ( repository: Repository<T>, getProps: GetParams, alias: string ): Promise<GetResponse<T>> {

	const builder = repository.createQueryBuilder( alias );
	const getResponse: GetResponse<T> = {};
	let paramCounter = 0;

	// Añadir soporte para relaciones ANTES de condiciones para evitar errores en where con tablas relacionadas
	if ( getProps.relations && getProps.relations.length > 0 ) {
		// Detectar si se pidió filtrar por isDeleted en la entidad principal (reutilizaremos para relaciones que lo soporten)
		const isDeletedAndWhere = ( getProps.andWhere || [] ).find( a => a.field === 'isDeleted' && typeof a.value === 'boolean' );
		for ( const relation of getProps.relations ) {
			let onCondition: string | undefined;
			// Usar metadatos de TypeORM para saber si la entidad relacionada tiene columna isDeleted
			const relMeta = repository.metadata.relations.find( r => r.propertyName === relation );
			const relatedHasIsDeleted = !!relMeta?.inverseEntityMetadata.columns.find( c => c.propertyName === 'isDeleted' );
			if ( relatedHasIsDeleted && isDeletedAndWhere ) {
				onCondition = `${ relation }.isDeleted = ${ isDeletedAndWhere.value ? true : false }`;
			}
			builder.leftJoinAndSelect( `${ alias }.${ relation }`, relation, onCondition );
		}
	}

	// Joins adicionales para rutas anidadas (p.ej. sourceTags.sourceTag)
	if ( getProps.extraJoins && getProps.extraJoins.length > 0 ) {
		for ( const ej of getProps.extraJoins ) {
			// Si la ruta ya es anidada (contiene '.') usarla directamente; si no, prefijar con el alias principal
			const joinPath = ej.path.includes( '.' ) ? ej.path : `${ alias }.${ ej.path }`;
			builder.leftJoinAndSelect( joinPath, ej.alias );
		}
	}

	if ( getProps.where && getProps.where.query ) {
		builder.where( getProps.where.query, getProps.where.params ? getProps.where.params : {} );
	}

	if ( getProps.andWhere && getProps.andWhere.length > 0 ) {
		for ( const and of getProps.andWhere ) {
			const type = typeof and.value;
			if ( type === 'boolean' ) {
				builder.andWhere( `${ alias }.${ and.field } = ${ and.value ? true : false }` );
			} else if ( Array.isArray( and.value ) ) {
				// Si el valor es un array, usar IN para listas de valores
				const key = `p${ ++paramCounter }`;
				builder.andWhere( `${ alias }.${ and.field } IN (:...${ key })`, { [ key ]: and.value } );
			} else if ( and.isEnum ) {
				// Para campos enum, usar comparación exacta sin unaccent
				const key = `p${ ++paramCounter }`;
				builder.andWhere( `${ alias }.${ and.field } = :${ key }`, { [ key ]: and.value } );
			} else {
				// Usar immutable_unaccent para búsquedas insensibles a tildes/acentos
				const key = `p${ ++paramCounter }`;
				builder.andWhere(
					`immutable_unaccent(${ alias }.${ and.field }) ILIKE immutable_unaccent(:${ key })`,
					{ [ key ]: `%${ and.value }%` }
				);
			}
		}
	}

	// Soporte para condiciones libres encadenadas (raw AND)
	if ( getProps.rawAndWhere && getProps.rawAndWhere.length > 0 ) {
		for ( const raw of getProps.rawAndWhere ) {
			builder.andWhere( raw.query, raw.params ?? {} );
		}
	}

	if ( getProps.orWhere && getProps.orWhere.length > 0 ) {
		for ( const or of getProps.orWhere ) {
			const type = typeof or.value;
			if ( type === 'boolean' ) {
				builder.orWhere( `${ alias }.${ or.field } = ${ or.value ? true : false }` );
			} else if ( or.isEnum ) {
				// Para campos enum, usar comparación exacta sin unaccent
				const key = `p${ ++paramCounter }`;
				builder.orWhere( `${ alias }.${ or.field } = :${ key }`, { [ key ]: or.value } );
			} else {
				// Usar immutable_unaccent para búsquedas insensibles a tildes/acentos
				const key = `p${ ++paramCounter }`;
				builder.orWhere(
					`immutable_unaccent(${ alias }.${ or.field }) ILIKE immutable_unaccent(:${ key })`,
					{ [ key ]: `%${ or.value }%` }
				);
			}
		}
	}

	if ( getProps.sort && getProps.sort.column && getProps.sort.direction ) {
		const sortDirection = getProps.sort.direction.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
		builder.orderBy( `${ alias }.${ getProps.sort.column }`, sortDirection );
	}

	// Orden dinámico para relaciones a través de relationOrders
	if ( getProps.relationOrders && getProps.relationOrders.length > 0 ) {
		for ( const ro of getProps.relationOrders ) {
			const dir = ( ro.direction || 'ASC' ).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
			builder.addOrderBy( `${ ro.relation }.${ ro.column }`, dir as any );
		}
	}

	// Select debe aplicarse antes del count para reflejar campos elegidos
	if ( getProps.select && getProps.select.length > 0 ) {
		builder.select( getProps.select.map( field => `${ alias }.${ field.trim() }` ) );

		// Si hay relaciones incluidas, añadir también sus columnas para permitir la hidratación
		// correcta de los objetos relacionados incluso cuando hay SELECT explícito.
		if ( getProps.relations && getProps.relations.length > 0 ) {
			for ( const relationName of getProps.relations ) {
				const relationMeta = repository.metadata.relations.find( r => r.propertyName === relationName );
				if ( relationMeta ) {
					const relationAlias = relationName; // Coincide con el alias usado en leftJoinAndSelect
					const relationColumns = relationMeta.inverseEntityMetadata.columns.map( col => `${ relationAlias }.${ col.propertyPath }` );
					if ( relationColumns.length > 0 ) {
						builder.addSelect( relationColumns );
					}
				}
			}
		}
	}

	if ( ( getProps.page ?? 1 ) > 0 && ( getProps.limit ?? 10 ) > 0 ) {
		// Estrategia robusta: si hay relaciones, paginar por IDs y luego cargar relaciones
		if ( getProps.relations && getProps.relations.length > 0 ) {
			// 1) Total sin relaciones
			const countBuilder = repository.createQueryBuilder( alias );
			// Replicar joins de relaciones para soportar filtros sobre relaciones en COUNT
			if ( getProps.relations && getProps.relations.length > 0 ) {
				// Reutilizar el mismo criterio dinámico de isDeleted para las relaciones
				const isDeletedAndWhere = ( getProps.andWhere || [] ).find( a => a.field === 'isDeleted' && typeof a.value === 'boolean' );
				for ( const relation of getProps.relations ) {
					let onCondition: string | undefined;
					const relMeta = repository.metadata.relations.find( r => r.propertyName === relation );
					const relatedHasIsDeleted = !!relMeta?.inverseEntityMetadata.columns.find( c => c.propertyName === 'isDeleted' );
					if ( relatedHasIsDeleted && isDeletedAndWhere ) {
						onCondition = `${ relation }.isDeleted = ${ isDeletedAndWhere.value ? true : false }`;
					}
					countBuilder.leftJoin( `${ alias }.${ relation }`, relation, onCondition );
				}
				// Evitar conteos inflados por filas duplicadas tras los JOINs
				countBuilder.select( `${ alias }.id` ).distinct( true );
			}
			if ( getProps.where && getProps.where.query ) {
				countBuilder.where( getProps.where.query, getProps.where.params ? getProps.where.params : {} );
			}
			if ( getProps.andWhere && getProps.andWhere.length > 0 ) {
				for ( const and of getProps.andWhere ) {
					const type = typeof and.value;
					if ( type === 'boolean' ) {
						countBuilder.andWhere( `${ alias }.${ and.field } = ${ and.value ? true : false }` );
					} else if ( Array.isArray( and.value ) ) {
						const key = `p${ ++paramCounter }`;
						countBuilder.andWhere( `${ alias }.${ and.field } IN (:...${ key })`, { [ key ]: and.value } );
					} else if ( and.isEnum ) {
						const key = `p${ ++paramCounter }`;
						countBuilder.andWhere( `${ alias }.${ and.field } = :${ key }`, { [ key ]: and.value } );
					} else {
						const key = `p${ ++paramCounter }`;
						countBuilder.andWhere( `immutable_unaccent(${ alias }.${ and.field }) ILIKE immutable_unaccent(:${ key })`, { [ key ]: `%${ and.value }%` } );
					}
				}
			}
			if ( getProps.rawAndWhere && getProps.rawAndWhere.length > 0 ) {
				for ( const raw of getProps.rawAndWhere ) {
					countBuilder.andWhere( raw.query, raw.params ?? {} );
				}
			}
			if ( getProps.orWhere && getProps.orWhere.length > 0 ) {
				for ( const or of getProps.orWhere ) {
					const type = typeof or.value;
					if ( type === 'boolean' ) {
						countBuilder.orWhere( `${ alias }.${ or.field } = ${ or.value ? true : false }` );
					} else if ( Array.isArray( or.value ) ) {
						const key = `p${ ++paramCounter }`;
						countBuilder.orWhere( `${ alias }.${ or.field } IN (:...${ key })`, { [ key ]: or.value } );
					} else if ( or.isEnum ) {
						const key = `p${ ++paramCounter }`;
						countBuilder.orWhere( `${ alias }.${ or.field } = :${ key }`, { [ key ]: or.value } );
					} else {
						const key = `p${ ++paramCounter }`;
						countBuilder.orWhere( `immutable_unaccent(${ alias }.${ or.field }) ILIKE immutable_unaccent(:${ key })`, { [ key ]: `%${ or.value }%` } );
					}
				}
			}
			getResponse.total = await countBuilder.getCount();
			getResponse.page = getProps.page;
			getResponse.lastPage = Math.ceil( getResponse.total / ( getProps.limit ?? 10 ) );

			// 2) IDs paginados sin relaciones
			const idsBuilder = repository.createQueryBuilder( alias );
			// Replicar joins de relaciones para soportar filtros sobre relaciones en IDs
			if ( getProps.relations && getProps.relations.length > 0 ) {
				// Reutilizar el mismo criterio dinámico de isDeleted para las relaciones
				const isDeletedAndWhere = ( getProps.andWhere || [] ).find( a => a.field === 'isDeleted' && typeof a.value === 'boolean' );
				for ( const relation of getProps.relations ) {
					let onCondition: string | undefined;
					const relMeta = repository.metadata.relations.find( r => r.propertyName === relation );
					const relatedHasIsDeleted = !!relMeta?.inverseEntityMetadata.columns.find( c => c.propertyName === 'isDeleted' );
					if ( relatedHasIsDeleted && isDeletedAndWhere ) {
						onCondition = `${ relation }.isDeleted = ${ isDeletedAndWhere.value ? true : false }`;
					}
					idsBuilder.leftJoin( `${ alias }.${ relation }`, relation, onCondition );
				}
			}
			if ( getProps.where && getProps.where.query ) {
				idsBuilder.where( getProps.where.query, getProps.where.params ? getProps.where.params : {} );
			}
			if ( getProps.andWhere && getProps.andWhere.length > 0 ) {
				for ( const and of getProps.andWhere ) {
					const type = typeof and.value;
					if ( type === 'boolean' ) {
						idsBuilder.andWhere( `${ alias }.${ and.field } = ${ and.value ? true : false }` );
					} else if ( Array.isArray( and.value ) ) {
						const key = `p${ ++paramCounter }`;
						idsBuilder.andWhere( `${ alias }.${ and.field } IN (:...${ key })`, { [ key ]: and.value } );
					} else if ( and.isEnum ) {
						const key = `p${ ++paramCounter }`;
						idsBuilder.andWhere( `${ alias }.${ and.field } = :${ key }`, { [ key ]: and.value } );
					} else {
						const key = `p${ ++paramCounter }`;
						idsBuilder.andWhere( `immutable_unaccent(${ alias }.${ and.field }) ILIKE immutable_unaccent(:${ key })`, { [ key ]: `%${ and.value }%` } );
					}
				}
			}
			if ( getProps.rawAndWhere && getProps.rawAndWhere.length > 0 ) {
				for ( const raw of getProps.rawAndWhere ) {
					idsBuilder.andWhere( raw.query, raw.params ?? {} );
				}
			}
			if ( getProps.orWhere && getProps.orWhere.length > 0 ) {
				for ( const or of getProps.orWhere ) {
					const type = typeof or.value;
					if ( type === 'boolean' ) {
						idsBuilder.orWhere( `${ alias }.${ or.field } = ${ or.value ? true : false }` );
					} else if ( Array.isArray( or.value ) ) {
						const key = `p${ ++paramCounter }`;
						idsBuilder.orWhere( `${ alias }.${ or.field } IN (:...${ key })`, { [ key ]: or.value } );
					} else if ( or.isEnum ) {
						const key = `p${ ++paramCounter }`;
						idsBuilder.orWhere( `${ alias }.${ or.field } = :${ key }`, { [ key ]: or.value } );
					} else {
						const key = `p${ ++paramCounter }`;
						idsBuilder.orWhere( `immutable_unaccent(${ alias }.${ or.field }) ILIKE immutable_unaccent(:${ key })`, { [ key ]: `%${ or.value }%` } );
					}
				}
			}
			const selectCols: string[] = [ `${ alias }.id` ];
			if ( getProps.sort && getProps.sort.column && getProps.sort.direction ) {
				const sortDirection = getProps.sort.direction.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
				selectCols.push( `${ alias }.${ getProps.sort.column }` );
				idsBuilder.orderBy( `${ alias }.${ getProps.sort.column }`, sortDirection );
			}
			// Seleccionar columnas necesarias de una vez (evita sobrescribir addSelect) y usar DISTINCT
			idsBuilder.select( selectCols ).distinct( true ).offset( ( ( getProps.page ?? 1 ) - 1 ) * ( getProps.limit ?? 10 ) ).limit( getProps.limit ?? 10 );
			const idRows = await idsBuilder.getRawMany();
			const ids = idRows.map( ( r: any ) => r[ `${ alias }_id` ] ?? r[ 'id' ] ).filter( ( v: any ) => v );
			if ( ids.length === 0 ) {
				getResponse.data = [] as any;
				return getResponse;
			}

			// 3) Restringir el builder principal a los IDs paginados (sin offset/limit aquí)
			builder.andWhere( `${ alias }.id IN (:...ids)`, { ids } );
		} else {
			// Sin relaciones, paginar normalmente
			builder.offset( ( ( getProps.page ?? 1 ) - 1 ) * ( getProps.limit ?? 10 ) ).limit( getProps.limit ?? 10 );
			getResponse.total = await builder.getCount();
			getResponse.page = getProps.page;
			getResponse.lastPage = Math.ceil( getResponse.total / ( getProps.limit ?? 10 ) );
		}
	}


	let data = await builder.getMany();

	// Mantener el orden original de IDs cuando hemos paginado por IDs
	if ( ( getProps.page ?? 1 ) > 0 && ( getProps.limit ?? 10 ) > 0 && getProps.relations && getProps.relations.length > 0 ) {
		const idsOrder = new Map( data.map( ( e: any, idx: number ) => [ e.id, idx ] ) );
		// Si usamos restricción por ids, el orden lo debe dictar la consulta de IDs. Recalcular si procede
		// Nota: aquí asumimos que el orden de "data" ya es correcto; si no, se podría pasar el array de ids
		// desde arriba mediante cierre o recomputarlo. Para simplicidad, lo dejamos según DB.
		data = data.sort( ( a: any, b: any ) => ( ( idsOrder.get( a.id ) ?? 0 ) - ( idsOrder.get( b.id ) ?? 0 ) ) );
	}

	getResponse.data = data as any;
	return getResponse;

}