const User = require("tests/orm/setup/user.model");

describe("setCreatedAt() method", () => {
  test("setCreatedAt method returns a query builder", () => {
    const users = User.setCreatedAt("created_at");
    expect(users.builder).toBeTruthy();
  });

  test("setCreatedAt method should change created_at column name", () => {
    expect(User.getCreatedAt).toEqual("created_at");
    const users = User.setCreatedAt("created_date");
    expect(users.getCreatedAt).toEqual("created_date");
  });

  test("setCreatedAt method to createToSql", async () => {
    const users = await User.setCreatedAt("created_date")
      .set("name", "Raymundo")
      .insertToSql();
    expect(users).toEqual(
      "INSERT INTO `users` (`name`, `created_date`) VALUES (?, ?)"
    );
  });
});
