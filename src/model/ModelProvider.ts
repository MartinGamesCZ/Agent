import { Application } from "../Application";
import type { Logger } from "../utils/Logger";
import type { Conversation } from "./Conversation";

export interface IModelProvider {
  id: string;

  chat(conversation: Conversation): Promise<string>;
}

export class ModelProviderManager {
  #providers: IModelProvider[] = [];
  #currentProvider: IModelProvider | null = null;

  #logger: Logger;

  constructor(logger: Logger) {
    this.#logger = logger;
  }

  addProvider(provider: new () => IModelProvider): void {
    this.#providers.push(new provider());
  }

  async init(): Promise<void> {
    this.#logger.log("Initializing model providers...");

    const provider =
      Application.getInstance().configuration.config.ai?.provider;
    if (!provider) {
      throw new Error("No provider configured");
    }

    this.#currentProvider =
      this.#providers.find((prov) => prov.id === provider) ?? null;

    if (!this.#currentProvider) {
      throw new Error(`Provider ${provider} not found`);
    }

    this.#logger.log(`Using provider ${this.#currentProvider.id}`);
  }

  async chat(conversation: Conversation): Promise<string> {
    if (!this.#currentProvider) {
      throw new Error("No provider configured");
    }

    return await this.#currentProvider.chat(conversation);
  }
}
