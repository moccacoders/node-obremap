import "../config/prototypes.config";
import chalk from "chalk";
import moment from "moment-timezone";
import adapter from "./adapters";
import { getTableName, getFieldName } from "../global/get-name";
import { microtime } from "../config/utils";

export default class Migration {
  constructor() {
    console.log("this", this);
    if (typeof this.constructor.up === "undefined")
      throw Error(`Method [up] missing from ${this.constructor.name}`);
    if (typeof this.constructor.down === "undefined")
      throw Error(`Method [down] missing from ${this.constructor.name}`);

    return this.container
      ? this.container.call([this, "run"])
      : this.constructor.run();
  }

  static call(classes, silent = false) {
    classes = classes.wrap();
    classes.map(($class) => {
      let seeder = this.resolve($class);
      let name = seeder.name;
      let startTime = microtime(true);

      if (silent === false) console.log(chalk.yellow("Seeding:"), name);

      try {
        seeder = new seeder();
        let runTime = parseFloat(microtime(true) - startTime).toFixed(2);
        if (silent === false)
          console.log(chalk.green("Seeded:"), name, `${runTime} Seconds`);
      } catch (err) {
        console.log(err.message);
        process.exit();
      }
    });
  }

  static resolve(Class) {
    let instance;
    if (typeof Class == "function") instance = Class;

    return instance;
  }
}
