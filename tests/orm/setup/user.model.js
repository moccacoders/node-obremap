const Model = require("orm/model").default;
class User extends Model {
  static casts = {
    deleted: "boolean",
    created_at: "timestamp",
    deleted_at: "timestamp",
  };
}
module.exports = new User();
