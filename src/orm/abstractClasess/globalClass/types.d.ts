export interface IGlobalClass {
	options?: IOptions
	dateFormat?: string
	timezone?: string
	connection?: string
	adapter?: string

	currentAdapter: () => string
}

export interface IOptions {}
