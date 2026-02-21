import chalk from "chalk";

export class Logger {
  #module: string;

  constructor(module: string) {
    this.#module = module;
  }

  submodule(module: string): Logger {
    return new Logger(`${this.#module}::${module}`);
  }

  log(message: string): void {
    console.log(`${chalk.blue(this.#module)} ${message}`);
  }
}
