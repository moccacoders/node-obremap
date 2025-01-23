export interface IModel {
	snakeCase?: boolean
	tableName?: string
	primaryKey?: string
	incrementing?: boolean
	keyType?: string
	timestamps?: boolean
	dateFormat?: string
	createdAt?: string | null
	updatedAt?: string | null
	timezone?: string
	connection?: string
	adapter?: string
	logicalDelete?: boolean
	deleted?: string
	deletedAt?: string
	deletedBy?: string
	casts?: ICasts
	options?: any
}
export interface ICasts {}
export interface IOptions {}

export type TModelMethods = "sql" | "currentAdapter"
export type QueryValues = Array<string>
