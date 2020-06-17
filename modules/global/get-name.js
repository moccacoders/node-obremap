import pluralize from 'pluralize'

/*
  Get plural name for table
  ex Chat -> chats

  Get field name for relationships
  ex Chat -> chat_id
*/
module.exports = {
  getTableName: (model, toSnakeCase) => typeof model === 'string' ? toCase(pluralize(model), toSnakeCase) : null,
  getFieldName: (model, toSnakeCase) => typeof model === 'string' ? `${toCase(model, toSnakeCase)}_id` : null
}

const toCase = (str, toSnakeCase = true) => {
	switch(toSnakeCase){
		case false:
			str = str.replace(/(_\w)/g, function(m){
				return m[1].toUpperCase();
			});
		break;
		default:
			str = str.replace(/[\w]([A-Z])/g, function(m) {
				return m[0] + "_" + m[1];
			}).toLowerCase();
	}
	str = uncapitalize(str);
	return str;
}

const uncapitalize = (str) => {
	return str.charAt(0).toLowerCase() + str.slice(1);
}