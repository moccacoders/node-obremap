import adapters from "adapters"
import AdaptersBase from "abstract/adapters/AdaptersBase"
import { IModel, QueryValues } from "abstract/model/types"
import GlobalClass from "abstract/globalClass"

class QueryBuilder extends GlobalClass {
	model: IModel

	constructor(model) {
		super()
		this.model = model
	}

	get adapter(): AdaptersBase {
		return adapters(this)
	}

	query(query: string, values: QueryValues): string {
		return this.adapter.sanitizer(query, values)
	}

	all() {
		return this.adapter.all()
	}

	first() {
		return this.adapter.first()
	}
}

export default QueryBuilder
