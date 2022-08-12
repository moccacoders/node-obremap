const User = require("tests/orm/setup/user.model");

describe("setTimestamps() method", () => {
  test("setTimestamps method returns a query builder", () => {
    const users = User.setTimestamps(true);
    expect(users.builder).toBeTruthy();
  });

  test("setTimestamps method should change timestamps", () => {
    expect(User.timestamps).toBeTruthy();
    const users = User.setTimestamps(false);
    expect(users.options.timestamps).toBeFalsy();
  });

  test("setTimestamps as TRUE method to insertToSql", async () => {
    const users = await User.setTimestamps(true)
      .set("name", "Raymundo")
      .insertToSql();
    expect(users).toEqual(
      "INSERT INTO `users` (`name`, `created_at`) VALUES (?, ?)"
    );
  });

  test("setTimestamps as TRUE method to updateToSql", async () => {
    const users = await User.setTimestamps(true)
      .set("name", "Rodolfo")
      .updateToSql();
    expect(users).toEqual("UPDATE `users` SET `name` = ?, `updated_at` = ?");
  });

  test("setTimestamps as FALSE method to insertToSql", async () => {
    const users = await User.setTimestamps(false)
      .set("name", "Raymundo")
      .insertToSql();
    expect(users).toEqual("INSERT INTO `users` (`name`) VALUES (?)");
  });

  test("setTimestamps as FALSE method to updateToSql", async () => {
    const users = await User.setTimestamps(false)
      .set("name", "Rodolfo")
      .updateToSql();
    expect(users).toEqual("UPDATE `users` SET `name` = ?");
  });
});
