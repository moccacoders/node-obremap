import "../config/prototypes.config";
import chalk from "chalk";
import moment from "moment-timezone";
import adapter from "./adapters";
import { getTableName, getFieldName } from "../global/get-name";
import { microtime } from "../config/utils";

export default class Seeder {
  static container;
  static command;

  constructor() {
    if (typeof this.constructor.run === "undefined")
      throw Error(`Method [run] missing from ${this.constructor.name}`);

    return this.container
      ? this.container.call([this, "run"])
      : this.constructor.run();
  }

  static async call(classes, silent = false) {
    classes = classes.wrap();
    for (const Seeder of classes) {
      if (!Seeder.prototype instanceof Seeder) return false;
      let name = Seeder.name;
      let startTime = microtime(true);

      if (silent === false) console.log(chalk.yellow("Seeding:"), name);
      try {
        Seeder = await Seeder.run();
        let runTime = parseFloat(microtime(true) - startTime).toFixed(2);

        if (silent === false)
          console.log(chalk.green("Seeded:"), name, `${runTime} Seconds`);
      } catch (err) {
        console.log(chalk.red("Error:"), err.message);
        if (global.dev) console.log(err);
      }
    }
  }
}
