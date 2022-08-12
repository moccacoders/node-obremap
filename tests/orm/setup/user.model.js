const Model = require("orm/model").default;
module.exports = class User extends Model {
  static casts = {
    deleted: "boolean",
    created_at: "timestamp",
    deleted_at: "timestamp",
  };
};
