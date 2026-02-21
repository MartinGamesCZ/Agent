import type { Logger } from "../../utils/Logger";
import type { IProvider } from "../provider";

export class DiscordBotProvider implements IProvider {
  readonly name: string = "DiscordBotProvider";

  #logger: Logger;

  #isRunning: boolean = false;

  constructor(logger: Logger) {
    this.#logger = logger;
  }

  async validateConfiguration(): Promise<boolean> {
    this.#logger.log("Validating configuration...");

    return false;
  }

  async start(): Promise<void> {
    if (this.#isRunning) return;

    this.#logger.log("Starting Discord bot provider...");

    this.#isRunning = true;
  }

  async stop(): Promise<void> {
    if (!this.#isRunning) return;

    this.#logger.log("Stopping Discord bot provider...");

    this.#isRunning = false;
  }
}
