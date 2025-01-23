import QueryBuilderBase from "abstract/queryBuilder"
import GlobalClass from "abstract/globalClass"
import { CasesTypes } from "utils"
import { ICasts, IOptions, TModelMethods } from "./types"

abstract class Model extends GlobalClass {
	// TABLE NAMES
	static tableName?: string = undefined
	static caseType?: CasesTypes = "snakecase"
	static pluralize?: boolean = true

	// PRIMARY KEYS
	static primaryKey?: string = "id"
	static incrementing?: boolean = true
	static keyType?: string = "int"

	//TIMESTAMPS
	// If createdAt or updatedAt is setting as null this will not be in query
	static timestamps?: boolean = true
	static createdAt?: string | null = "created_at"
	static updatedAt?: string | null = "updated_at"

	// Logical Delete
	static logicalDelete?: boolean = false
	static deleted?: string = "deleted"
	static deletedAt?: string = "deleted_at"
	static deletedBy?: string = "deleted_by"

	static casts?: ICasts = {}

	constructor() {
		super()
		const QueryBuilder = require(`../../adapters/${this.currentAdapter}/queryBuilder`).default
		const proxy: Model | QueryBuilderBase = new Proxy(this, {
			get: function get(_class: Model, method: TModelMethods) {
				if (method in _class) return _class[method]
				return new QueryBuilder(_class.model)[method]
			},
		})

		return proxy
	}
}

export default Model
