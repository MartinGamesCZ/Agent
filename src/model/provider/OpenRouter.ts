import { callModel } from "@openrouter/sdk/funcs/call-model.js";
import type { Conversation } from "../Conversation";
import type { IModelProvider } from "../ModelProvider";
import { OpenRouter } from "@openrouter/sdk";
import { Application } from "../../Application";

export class OpenRouterModelProvider implements IModelProvider {
  readonly id = "openrouter";

  #openRouter: OpenRouter;

  constructor() {
    const configuration = Application.getInstance().configuration.config;
    const apiKey = configuration.models?.openrouter?.apiKey;

    if (!apiKey) {
      throw new Error("OpenRouter API key not found");
    }

    this.#openRouter = new OpenRouter({ apiKey });
  }

  async chat(
    conversation: Conversation,
    options?: { model?: string; tools?: any[] },
  ): Promise<string> {
    const response = await callModel(this.#openRouter, {
      model:
        options?.model ||
        Application.getInstance().configuration.config.ai?.model ||
        "",
      input: conversation.toOpenAIFormat(),
      tools: options?.tools,
    });

    const message = await response.getText();

    return message;
  }
}
