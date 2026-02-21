import type { Logger } from "../utils/Logger";

export interface IProvider {
  name: string;

  start(): Promise<void>;
  stop(): Promise<void>;
  validateConfiguration(): Promise<boolean>;
}

export class ProviderManager {
  #providers: IProvider[] = [];
  #logger: Logger;

  constructor(logger: Logger) {
    this.#logger = logger;
  }

  addProvider(provider: new (logger: Logger) => IProvider): void {
    this.#logger.log(`Adding provider ${provider.name}`);

    this.#providers.push(new provider(this.#logger.submodule(provider.name)));
  }

  async startAll(): Promise<void> {
    await Promise.all(this.#providers.map(this.#startProvider.bind(this)));

    this.#logger.log("All providers started.");
  }

  async stopAll(): Promise<void> {
    await Promise.all(this.#providers.map((provider) => provider.stop()));

    this.#logger.log("All providers stopped.");
  }

  async #startProvider(provider: IProvider): Promise<void> {
    const configValid = await provider.validateConfiguration();
    if (!configValid) {
      this.#logger.log(
        `Provider ${provider.name} configuration is not valid, not starting.`,
      );

      return;
    }

    await provider.start();
  }
}
