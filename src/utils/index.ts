export type CasesTypes = "camelcase" | "snakecase" | "upercamelcase"

export const uncapitalize = (str: string): string => {
	let string = str.split(" ").map(s => {
		return s.charAt(0).toLowerCase() + s.slice(1)
	})
	return string.join(" ")
}

export const capitalize = (str: string): string => {
	let string = str.split(" ").map(s => {
		return s.charAt(0).toUpperCase() + s.slice(1)
	})
	return string.join(" ")
}

export const toCase = (str: string, type: CasesTypes = "snakecase"): string => {
	switch (type) {
		case "camelcase":
		case "upercamelcase":
			str = str
				.replace(/[\w]([A-Z])|(_|\ )(\w)/g, function (m) {
					return `${/(_|\ )/.test(m[0]) ? "" : m[0]}${m[1].toUpperCase()}`
				})
				.trim()
			break
		default:
			str = str
				.replace(/[\w]([A-Z])/g, function (m) {
					return m[0] + "_" + m[1]
				})
				.trim()
				.replace(/\s+/g, "_")
				.toLowerCase()
	}
	if (type == "upercamelcase") str = capitalize(str)
	else str = uncapitalize(str)
	return str
}
