import { YAML } from "bun";
import { exists, readFile, writeFile } from "fs/promises";
import path from "path";
import type { Logger } from "../utils/Logger";

interface IConfiguration {
  providers: Partial<{
    discord: Partial<{
      token: string;
    }>;
  }>;
}

export const defaultConfiguration: Partial<IConfiguration> = {
  providers: {
    discord: {
      token: "YOUR_DISCORD_TOKEN",
    },
  },
};

export class Configuration {
  #configuration: Partial<IConfiguration> = {};
  #logger: Logger;

  static PATH = path.join(process.cwd(), "data/agent.yaml");

  constructor(logger: Logger) {
    this.#logger = logger;
  }

  get config(): Partial<IConfiguration> {
    return this.#configuration;
  }

  async load(): Promise<void> {
    this.#logger.log("Loading configuration...");

    const exists = await this.#exists();

    if (!exists) await this.#createDefault();
    else this.#configuration = await this.#load();
  }

  async save(): Promise<void> {
    await this.#save();
  }

  async #exists(): Promise<boolean> {
    return await exists(Configuration.PATH);
  }

  async #createDefault(): Promise<void> {
    this.#logger.log(
      "Config file not found. Creating default configuration...",
    );

    this.#configuration = defaultConfiguration;

    await this.#save();
  }

  async #load(): Promise<Partial<IConfiguration>> {
    const file = await readFile(Configuration.PATH, "utf-8");

    return YAML.parse(file) as Partial<IConfiguration>;
  }

  async #save(): Promise<void> {
    this.#logger.log("Saving configuration...");

    const file = YAML.stringify(this.#configuration, null, 2);
    await writeFile(Configuration.PATH, file);

    this.#logger.log("Configuration saved.");
  }
}
