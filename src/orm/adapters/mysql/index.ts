import GlobalClass from "abstract/globalClass"
import AdaptersBase from "abstract/adapters/AdaptersBase"
import { QueryValues } from "abstract/model/types"
import mysql from "mysql"

class MySQL extends GlobalClass implements AdaptersBase {
	constructor(model) {
		super()
		this.model = model
	}

	all() {
		return this.getTableName
	}

	sanitizer(query: string, values: QueryValues) {
		return mysql.format(query, values)
	}
}
export default MySQL
