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

    process.on("SIGINT", this.#handleShutdown.bind(this));
    process.on("SIGTERM", this.#handleShutdown.bind(this));
    process.on("exit", this.#handleShutdown.bind(this));
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

  async stop(): Promise<void> {
    this.logger.log("Stopping application...");

    await this.#providerManager.stopAll();

    this.logger.log("Application stopped.");
  }

  async #handleShutdown(signal: string): Promise<void> {
    this.logger.log(`Received ${signal} signal, shutting down application...`);

    await this.stop();
  }
}
