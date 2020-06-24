const uncapitalize = (str) => {
	return str.charAt(0).toLowerCase() + str.slice(1);
}

const capitalize = (str) => {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

const toCase = (str, toSnakeCase = true, cap = false) => {
	switch(toSnakeCase){
		case false:
			str = str.toLowerCase().replace(/(_|\ )(\w)/g, function(m){
				return m[1].toUpperCase();
			}).trim();
		break;
		default:
			str = str.replace(/[\w]([A-Z])/g, function(m) {
				return m[0] + "_" + m[1];
			}).trim().replace(/\s+/g, "_").toLowerCase();
	}
	if(!cap) str = uncapitalize(str);
	else str = capitalize(str);
	return str;
}

const regex = {
	url : /^([a-z\+]+):\/\/([\w\d]+):([\w\d\.\?\!\#\/\\\*\-\%]+)@(((\d{1,3}):(\d{1,3}):(\d{1,3}))|([\w\d\.]+))(:([\d]{2,}))?(\/([\w\d\-\.]+))(\?(.+))?$/
}

export default { uncapitalize, capitalize, toCase, regex }