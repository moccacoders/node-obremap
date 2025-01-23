import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"
import pluralize from "pluralize"

import { IOptions, QueryValues } from "abstract/model/types"
import { toCase } from "utils"
import { IGlobalClass } from "./types"

dayjs.extend(utc)
dayjs.extend(timezone)

class GlobalClass implements IGlobalClass {
	protected model: any
	options: IOptions = {}

	// DATES
	static dateFormat?: string = "TIMESTAMP"
	static timezone?: string = undefined

	// DB CONNECTION
	static connection?: string = "default"
	static adapter?: string = "mysql"
	static tableName?: string

	constructor() {
		this.model = this.constructor
	}

	get currentAdapter() {
		return this.model.adapter
	}

	static sql(sql: string, values: QueryValues) {
		return (new this() as any).sql(sql, values)
	}

	static TZ(timezone: string) {
		this.timezone = timezone
		return this
	}

	static setDateFormat(format: string) {
		this.dateFormat = format
		return this
	}

	static get currentDate() {
		return this.formatDate()
	}

	static get getTimezone() {
		return this.timezone || global.TZ || process.env.TZ || undefined
	}

	static get getDateFormat() {
		return this.dateFormat != "TIMESTAMP" ? this.dateFormat : undefined
	}

	static formatDate(date?: Date, format: boolean = true) {
		if (!format) return
		if (!date) date = new Date()
		return dayjs(date).tz(this.getTimezone).format(this.getDateFormat)
	}

	get getTableName() {
		let name = this.model.tableName
		if (!name) {
			name = this.model.name
			if (this.model.pluralize) name = pluralize(name)
			name = toCase(name, this.model.caseType)
		}

		return name
	}

	minimumRequirements(): boolean {
		return true
	}
}

export default GlobalClass
