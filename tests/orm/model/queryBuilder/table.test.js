const User = require("tests/orm/setup/user.model");

describe("Table() method", () => {
  test("Table method returns a query builder", () => {
    const users = User.table();
    expect(users.builder).toBeTruthy();
  });

  test("Table method should change tableName", () => {
    expect(User.getTableName).toEqual("`users`");
    const users = User.table("user");
    expect(typeof users.getTableName).toEqual("string");
    expect(users.getTableName).toEqual("`user`");
  });

  test("Table method to SQL", async () => {
    const users = await User.table("user").toSql();
    expect(users).toEqual("SELECT * FROM `user`");
  });
});
