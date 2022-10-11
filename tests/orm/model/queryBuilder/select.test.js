const User = require("tests/orm/setup/user.model");

describe("Select() method", () => {
  test("Select method returns a query builder", () => {
    const users = User.select();
    expect(users.builder).toBeTruthy();
    expect(typeof users.options.select).toEqual("object");
    expect(users.options.select.length).toEqual(0);
  });

  test("Select method with one column", () => {
    const users = User.select("id");
    expect(users.options.select.length).toEqual(1);
    expect(users.options.select[0]).toEqual("id");
  });

  test("Select method with two columns", () => {
    const users = User.select("id", "name");
    expect(users.options.select.length).toEqual(2);
    expect(users.options.select[0]).toEqual("id");
    expect(users.options.select[1]).toEqual("name");
  });

  test("Select method to SQL", async () => {
    const users = await User.select("id", "name").toSql();
    expect(users).toEqual("SELECT `id`, `name` FROM `users`");
  });

  test("Select method to GET", async () => {
    const users = await User.select("id", "name").get();
    expect(typeof users).toEqual("object");
    expect(users.length).toBeGreaterThan(0);
    expect(users[0]).toHaveProperty("id");
    expect(users[0]).toHaveProperty("name");
  });
});
