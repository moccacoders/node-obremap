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
    // Validate if database exist
    const dbExists = await Model.sql(
      `SELECT * FROM INFORMATION_SCHEMA.SCHEMATA where SCHEMA_NAME = ?`,
      [database]
    );

    const response = await Model.sql(
      `SELECT * FROM information_schema.tables WHERE table_schema = ?`,
      [database]
    );

    expect(dbExists.length).toEqual(1);
    expect(dbExists[0].schema_name ?? dbExists[0].SCHEMA_NAME).toBe(database);
    expect(response.length).toBeGreaterThanOrEqual(0);
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
  });
});
