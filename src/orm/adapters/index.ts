const adapters = model => {
	try {
		const adapter = model.currentAdapter
		const Adapter = require(`./${adapter}`).default
		return new Adapter(model.model)
	} catch (error) {
		throw new Error(error)
	}
}
export default adapters
