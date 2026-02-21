import { Application } from "../Application";
import type { Logger } from "../utils/Logger";
import { Conversation } from "./Conversation";

export class Assistant {
  #conversation: Conversation | null = null;
  #logger: Logger;
  #application: Application;

  #onResponse: (message: string) => void = () => {};

  constructor(logger: Logger) {
    this.#logger = logger;
    this.#application = Application.getInstance();
  }

  get conversation(): Conversation | null {
    return this.#conversation;
  }

  onResponse(onResponse: (message: string) => void): void {
    this.#onResponse = onResponse;
  }

  async createConversation(): Promise<void> {
    this.#logger.log("Creating conversation...");

    this.#conversation = new Conversation();

    await this.#application.storage.saveConversation(this.#conversation);
  }

  useConversation(conversation: Conversation): void {
    this.#conversation = conversation;
  }

  async run(): Promise<void> {
    if (!this.#conversation) return;

    const response = await this.#application.modelManager.chat(
      this.#conversation,
    );

    this.#onResponse(response);
    this.#conversation.addAssistantMessage(response);

    await this.#application.storage.saveConversation(this.#conversation);
  }
}
