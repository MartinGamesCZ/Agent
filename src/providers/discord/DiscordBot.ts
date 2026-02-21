import {
  ChannelType,
  Client,
  GatewayIntentBits,
  Message,
  ThreadChannel,
} from "discord.js";
import { Application } from "../../Application";
import type { Logger } from "../../utils/Logger";
import type { IProvider } from "../provider";
import { Assistant } from "../../model/Assistant";

export class DiscordBotProvider implements IProvider {
  readonly name: string = "DiscordBotProvider";

  #logger: Logger;

  #isRunning: boolean = false;
  #client: Client;

  constructor(logger: Logger) {
    this.#logger = logger;
    this.#client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });
  }

  async validateConfiguration(): Promise<boolean> {
    this.#logger.log("Validating configuration...");

    const token =
      Application.getInstance().configuration.config.providers?.discord?.token;

    return !!token && token !== "YOUR_DISCORD_TOKEN";
  }

  async start(): Promise<void> {
    if (this.#isRunning) return;

    this.#logger.log("Starting Discord bot provider...");

    const token =
      Application.getInstance().configuration.config.providers?.discord?.token;
    await this.#client.login(token);

    await new Promise((resolve) => this.#client.once("clientReady", resolve));
    this.#logger.log(`Logged in as ${this.#client.user?.tag}!`);

    this.#isRunning = true;

    this.#attachEventListeners();
  }

  async stop(): Promise<void> {
    if (!this.#isRunning) return;

    this.#logger.log("Stopping Discord bot provider...");

    await this.#client.destroy();
    this.#isRunning = false;
  }

  #attachEventListeners(): void {
    this.#client.on("messageCreate", this.#onMessage.bind(this));
  }

  async #onMessage(message: Message): Promise<void> {
    if (message.author.bot) return;
    if (message.mentions.users.has(this.#client.user?.id ?? ""))
      await this.#createConversation(message);
    if (
      message.channel.type === ChannelType.PublicThread ||
      message.channel.type === ChannelType.PrivateThread
    )
      await this.#handleThreadMessage(message);
  }

  async #createConversation(message: Message): Promise<void> {
    const assistant = new Assistant(this.#logger.submodule("Assistant"));
    await assistant.createConversation();

    const thread = await message.startThread({
      name: assistant.conversation!.id,
      autoArchiveDuration: 60,
    });

    assistant.onResponse(async (message: string) => {
      if (message.length > 1900) {
        await thread.send({
          files: [
            {
              attachment: Buffer.from(message, "utf-8"),
              name: "response.md",
            },
          ],
        });
      } else {
        await thread.send(message);
      }
    });

    assistant.conversation!.addUserMessage(message.cleanContent);
    await assistant.run();
  }

  async #handleThreadMessage(message: Message): Promise<void> {
    const app = Application.getInstance();
    const conversationId = (message.channel as ThreadChannel).name;

    const exists = await app.storage.checkIfExists(conversationId);
    if (!exists) return;

    const assistant = new Assistant(this.#logger.submodule("Assistant"));
    assistant.useConversation(
      await app.storage.getConversation(conversationId),
    );

    assistant.onResponse(async (msg: string) => {
      const channel = message.channel as ThreadChannel;
      if (msg.length > 3900) {
        await channel.send({
          files: [
            {
              attachment: Buffer.from(msg, "utf-8"),
              name: "response.md",
            },
          ],
        });
      } else {
        await channel.send(msg);
      }
    });

    assistant.conversation!.addUserMessage(message.cleanContent);
    await assistant.run();
  }
}
