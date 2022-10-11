const User = require("tests/orm/setup/user.model");

describe("Where() method", () => {
  test("Where method returns a query builder", () => {
    const users = User.where("column", "value");
    console.log("users", users);
    //   expect(users.builder).toBeTruthy();
    //   expect(typeof users.options.where).toEqual("object");
    //   expect(users.options.where.length).toEqual(1);
    //   expect(users.options.where[0]).toEqual({
    //     column: "column",
    //     operator: "=",
    //     value: "value",
    //     orWhere: false,
    //     separator: ", ",
    //     parenthesis: true,
    //     isFunction: false,
    //   });
    // });

    // test("Where method with another operator", () => {
    //   const users = User.where("column", "!=", "value");
    //   console.log("users", users.options.where);
    //   expect(users.options.where[0]).toEqual({
    //     column: "column",
    //     operator: "!=",
    //     value: "value",
    //     orWhere: false,
    //     separator: ", ",
    //     parenthesis: true,
    //     isFunction: false,
    //   });
  });

  //   test("Where method with two columns", () => {
  //     const users = User.where("id", "name");
  //     expect(users.options.where.length).toEqual(2);
  //     expect(users.options.where[0]).toEqual("id");
  //     expect(users.options.where[1]).toEqual("name");
  //   });

  //   test("Where method to SQL", async () => {
  //     const users = await User.where("id", "name").toSql();
  //     expect(users).toEqual("SELECT `id`, `name` FROM `users`");
  //   });

  //   test("Where method to GET", async () => {
  //     const users = await User.where("id", "name").get();
  //     expect(typeof users).toEqual("object");
  //     expect(users.length).toBeGreaterThan(0);
  //     expect(users[0]).toHaveProperty("id");
  //     expect(users[0]).toHaveProperty("name");
  //   });
});
