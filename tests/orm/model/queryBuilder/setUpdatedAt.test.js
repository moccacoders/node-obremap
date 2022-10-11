const User = require("tests/orm/setup/user.model");

describe("setUpdatedAt() method", () => {
  test("setUpdatedAt method returns a query builder", () => {
    const users = User.setUpdatedAt("updated_at");
    expect(users.builder).toBeTruthy();
  });

  test("setUpdatedAt method should change updated_at column name", () => {
    expect(User.getUpdatedAt).toEqual("updated_at");
    const users = User.setUpdatedAt("update_date");
    expect(users.getUpdatedAt).toEqual("update_date");
  });

  test("setUpdatedAt method to createToSql", async () => {
    const users = await User.setUpdatedAt("update_date")
      .set("name", "Raymundo")
      .updateToSql();
    expect(users).toEqual("UPDATE `users` SET `name` = ?, `update_date` = ?");
  });
});
