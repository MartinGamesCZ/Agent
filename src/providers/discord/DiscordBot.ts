import type { Logger } from "../../utils/Logger";
import type { IProvider } from "../provider";

export class DiscordBotProvider implements IProvider {
  #logger: Logger;

  constructor(logger: Logger) {
    this.#logger = logger;
  }

  async start(): Promise<void> {
    this.#logger.log("Starting Discord bot provider...");
  }

  async stop(): Promise<void> {
    this.#logger.log("Stopping Discord bot provider...");
  }
}
