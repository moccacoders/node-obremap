import { QueryValues } from "abstract/model/types"
import { boolean } from "yargs"

abstract class AdaptersBase {
	getTableName: string
	sanitizer: (query: string, values: QueryValues) => string
}

export default AdaptersBase
