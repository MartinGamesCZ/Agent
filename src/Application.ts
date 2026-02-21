import { Configuration } from "./configuration/Configuration";
import { DiscordBotProvider } from "./providers/discord/DiscordBot";
import { ProviderManager } from "./providers/provider";
import { Logger } from "./utils/Logger";
import { Storage } from "./model/Storage";
import { ModelProviderManager } from "./model/ModelProvider";
import { OpenRouterModelProvider } from "./model/provider/OpenRouter";

export class Application {
  static #instance: Application;

  #providerManager: ProviderManager;
  #modelManager: ModelProviderManager;

  public readonly logger: Logger;
  public readonly configuration: Configuration;
  public readonly storage: Storage;

  constructor() {
    this.logger = new Logger("Application");

    this.configuration = new Configuration(
      this.logger.submodule("Configuration"),
    );
    this.storage = new Storage(this.logger.submodule("Storage"));
    this.#providerManager = new ProviderManager(
      this.logger.submodule("ProviderManager"),
    );
    this.#modelManager = new ModelProviderManager(
      this.logger.submodule("ModelManager"),
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

  get modelManager() {
    return this.#modelManager;
  }

  /////////////////////////////////////////////////////////////////////////////

  async start(): Promise<void> {
    this.logger.log("Starting application...");

    await this.configuration.load();
    await this.storage.init();
    await this.#startProviders();
    await this.#startModels();
  }

  async #startProviders(): Promise<void> {
    this.#providerManager.addProvider(DiscordBotProvider);

    await this.#providerManager.startAll();
  }

  async #startModels(): Promise<void> {
    this.#modelManager.addProvider(OpenRouterModelProvider);

    await this.#modelManager.init();
  }

  /////////////////////////////////////////////////////////////////////////////

  async stop(): Promise<void> {
    this.logger.log("Stopping application...");

    await this.#providerManager.stopAll();
    await this.configuration.save();

    this.logger.log("Application stopped.");
  }

  async #handleShutdown(signal: string): Promise<void> {
    this.logger.log(`Received ${signal} signal, shutting down application...`);

    await this.stop();
  }
}
