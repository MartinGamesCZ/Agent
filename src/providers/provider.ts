import type { Logger } from "../utils/Logger";

export interface IProvider {
  start(): Promise<void>;
  stop(): Promise<void>;
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
    await Promise.all(this.#providers.map((provider) => provider.start()));
  }

  async stopAll(): Promise<void> {
    await Promise.all(this.#providers.map((provider) => provider.stop()));
  }
}
