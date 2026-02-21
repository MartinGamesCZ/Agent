import { DiscordBotProvider } from "./providers/discord/DiscordBot";
import { ProviderManager } from "./providers/provider";
import { Logger } from "./utils/Logger";

export class Application {
  static #instance: Application;

  #providerManager: ProviderManager;

  public readonly logger: Logger;

  constructor() {
    this.logger = new Logger("Application");

    this.#providerManager = new ProviderManager(
      this.logger.submodule("ProviderManager"),
    );
  }

  static getInstance(): Application {
    if (!Application.#instance) {
      Application.#instance = new Application();
    }

    return Application.#instance;
  }

  async start(): Promise<void> {
    this.logger.log("Starting application...");

    await this.#startProviders();
  }

  async #startProviders(): Promise<void> {
    this.#providerManager.addProvider(DiscordBotProvider);

    await this.#providerManager.startAll();
  }
}
