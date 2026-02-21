import path from "path";
import { Conversation } from "./Conversation";
import { exists, mkdir, readFile, writeFile } from "fs/promises";
import { mkdirSync } from "fs";
import type { Logger } from "../utils/Logger";

export class Storage {
  #logger: Logger;

  static readonly CONVERSATIONS_DATA_PATH = path.join(
    process.cwd(),
    "data/datastorage/conv",
  );

  constructor(logger: Logger) {
    this.#logger = logger;
  }

  async init(): Promise<void> {
    if (await exists(Storage.CONVERSATIONS_DATA_PATH)) return;

    this.#logger.log("Initializing data storage...");

    await mkdir(Storage.CONVERSATIONS_DATA_PATH, { recursive: true });
  }

  async checkIfExists(id: string): Promise<boolean> {
    return await exists(path.join(Storage.CONVERSATIONS_DATA_PATH, id));
  }

  async saveConversation(conversation: Conversation): Promise<void> {
    const file = path.join(Storage.CONVERSATIONS_DATA_PATH, conversation.id);
    await writeFile(file, JSON.stringify(conversation.getData()));
  }

  async getConversation(id: string): Promise<Conversation> {
    const file = path.join(Storage.CONVERSATIONS_DATA_PATH, id);
    const data = JSON.parse(await readFile(file, "utf-8"));

    return Conversation.fromData(data);
  }
}
