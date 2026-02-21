export class Logger {
  #module: string;

  constructor(module: string) {
    this.#module = module;
  }

  submodule(module: string): Logger {
    return new Logger(`${this.#module}::${module}`);
  }

  log(message: string): void {
    console.log(`[${this.#module}] ${message}`);
  }
}
