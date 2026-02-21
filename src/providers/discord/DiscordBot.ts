import { Client, GatewayIntentBits, Message } from "discord.js";
import { Application } from "../../Application";
import type { Logger } from "../../utils/Logger";
import type { IProvider } from "../provider";

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
    if (!message.mentions.users.has(this.#client.user?.id ?? "")) return;

    this.#logger.log("Received new message");
  }
}
