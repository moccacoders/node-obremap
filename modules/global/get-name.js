import pluralize from 'pluralize'
import Utils from "../config/utils";

/*
  Get plural name for table
  ex Chat -> chats

  Get field name for relationships
  ex Chat -> chat_id
*/
module.exports = {
  getTableName: (model, toSnakeCase) => typeof model === 'string' ? Utils.toCase(pluralize(model), toSnakeCase) : null,
  getFieldName: (model, toSnakeCase) => typeof model === 'string' ? `${Utils.toCase(model, toSnakeCase)}_id` : null
}