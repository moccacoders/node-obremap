const Model = require("orm/model").default;
const Schema = require("orm/schema").default;

describe("Validate model structure", () => {
  test("Model is a Model Object", () => {
    expect(Model.constructor.name).toBe("Function");
    expect(Model.name).toBe("Model");
  });

  test("Model has sql method", async () => {
    expect(Model.sql.name).toBe("sql");
    const { database } = Schema.getConnection;
    const response = await Model.sql(
      `SELECT * FROM information_schema.tables WHERE table_schema = ?`,
      [database]
    );
    expect(response.length).toBeGreaterThan(0);
    expect(response[0].TABLE_SCHEMA).toBe(database);
  });

  test("Model has getTimezone", async () => {
    expect(Model.getTimezone.constructor.name).toBe("String");
    const timezone = await Model.getTimezone;
    const config = require(`${process.cwd()}/obremap.config.js`);
    expect([process.env.TZ, config.timezone, "America/Los_Angeles"]).toContain(
      timezone
    );
  });

  test("Model has formatDate", async () => {
    expect(Model.formatDate.name).toBe("formatDate");
    expect(Model.formatDate()).toMatch(
      /([0-9]{4})-([0-9]{2})-([0-9]{2}) ([0-9]{2}):([0-9]{2}):([0-9]{2})/
    );
    // const timezone = await Model.getTimezone;
    // const config = require(`${process.cwd()}/obremap.config.js`);
    // expect([process.env.TZ, config.timezone, "America/Los_Angeles"]).toContain(
    //   timezone
    // );
  });
});
