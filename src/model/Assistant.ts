import { Application } from "../Application";
import type { Logger } from "../utils/Logger";
import { Conversation } from "./Conversation";
import { z } from "zod";

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

    this.#logger.log("Running assistant...");

    const delegateToSubagentTool = {
      type: "function" as const,
      function: {
        name: "delegate_to_subagent",
        description:
          "Delegate a task to a specialized subagent. Use this when you need specialized knowledge, research, or coding capabilities.",
        inputSchema: z.object({
          subagentId: z
            .string()
            .describe(
              "The ID of the subagent to delegate to (e.g., 'researcher', 'coder')",
            ),
          task: z
            .string()
            .describe("The specific task or question for the subagent"),
        }),
        execute: async (args: { subagentId: string; task: string }) => {
          this.#logger.log(
            `Delegating task to subagent ${args.subagentId}: ${args.task}`,
          );

          const subagent = this.#application.subagentManager.getAgent(
            args.subagentId,
          );
          if (!subagent) {
            return `Subagent with ID ${args.subagentId} not found. Available subagents: ${Array.from(this.#application.subagentManager.agents.keys()).join(", ")}`;
          }

          const subagentConversation = new Conversation();
          subagentConversation.addSystemMessage(subagent.systemPrompt);
          subagentConversation.addUserMessage(args.task);

          this.#onResponse(`*Delegating to ${subagent.name}...*`);

          try {
            const response = await this.#application.modelManager.chat(
              subagentConversation,
              {
                model: subagent.model,
              },
            );

            this.#onResponse(`*${subagent.name} says:* ${response}`);

            return `Response from ${subagent.name}:\n${response}`;
          } catch (error) {
            this.#logger.log(
              `Error from subagent ${args.subagentId}: ${error}`,
            );
            return `Failed to get a response from ${args.subagentId}: ${error}`;
          }
        },
      },
    };

    const response = await this.#application.modelManager.chat(
      this.#conversation,
      {
        tools: [delegateToSubagentTool],
      },
    );

    this.#onResponse(response);
    this.#conversation.addAssistantMessage(response);

    await this.#application.storage.saveConversation(this.#conversation);
  }
}
