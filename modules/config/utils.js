const uncapitalize = (str) => {
	let string = str.split(" ").map(s => {
		return s.charAt(0).toLowerCase() + s.slice(1);
	});
	return string.join(" ");
}

const capitalize = (str) => {
	let string = str.split(" ").map(s => {
		return s.charAt(0).toUpperCase() + s.slice(1);
	});
	return string.join(" ");
}

const toCase = (str, toSnakeCase, cap) => {
	switch(toSnakeCase){
		case false:
			str = str.replace(/[\w]([A-Z])|(_|\ )(\w)/g, function(m){
				return (`${/(_|\ )/.test(m[0]) ? "" : m[0]}${m[1].toUpperCase()}`);
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

exports.microtime = (getAsFloat) => {
	var s;
	var now = (Date.now ? Date.now() : new Date().getTime()) / 1000;
	if(getAsFloat) return now;
	s = now | 0;
	return (Math.round((now - s) * 1000) / 1000) + ' ' + s
}


exports.regex = {
	url : /^([a-z\+]+):\/\/([\w\d]+):([\w\d\.\?\!\#\/\\\*\-\%]+)@(((\d{1,3}):(\d{1,3}):(\d{1,3}))|([\w\d\.]+))(:([\d]{2,}))?(\/([\w\d\-\.]+))(\?(.+))?$/
}

exports.uncapitalize = uncapitalize;
exports.capitalize = capitalize;
exports.toCase = toCase;
