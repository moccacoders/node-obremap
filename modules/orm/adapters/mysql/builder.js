import adapter from './index'

export default class Builder {
	constructor(options, model) {
		this.options = options
		this.model = model
	}

	join(includeTable, localField, operator, remoteField, type = "INNER"){
		if(!["=", "<", ">", "!=", "<>", "<=", ">=", "<=>"].includes(operator)){
			if(remoteField) type = remoteField;
			remoteField = operator;
			operator = "=";
		}
		let join = {
			includeTable,
			localField,
			operator,
			remoteField,
			type : type.toUpperCase()
		};
		if(this.options.joins)
			this.options.joins.push(join)
		else this.options.joins = [join]
		return this;
	}

	orderBy(orderBy){
		this.options.orderBy = orderBy
		return this;
	}

	offset(offset){
		this.options.offset = offset
		return this;
	}

	limit(limit) {
		this.options.limit = limit
		return this
	}

	select(...select) {
		this.options.select = select
		return this
	}

	where(where) {
		this.options.where = where
		return this
	}

	set(data) {
		this.options.data = data
		return this;
	}

	first() {
		this.options.limit = 1
		return this.get()
	}

	all() {
		return adapter.select(this.options, this.model)
	}

	get() {
		return adapter.select(this.options, this.model)
	}

	update() {
		return adapter.update(this.options, this.model)
	}

	count() {
		this.options.select = `COUNT(${this.options.model.primaryKey}) as count`
		let result = adapter.select(this.options, this.model);
		return result;
	}
}
