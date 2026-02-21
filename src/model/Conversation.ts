import { randomUUID } from "crypto";
import { Message, MessageAuthor } from "./Message";

export class Conversation {
  #id: string;
  #messages: Message[] = [];

  constructor(id?: string, messages?: Message[]) {
    this.#id = id ?? randomUUID();
    this.#messages = messages ?? [];
  }

  get id(): string {
    return this.#id;
  }

  addSystemMessage(message: string): void {
    this.#messages.push(new Message(MessageAuthor.System, message));
  }

  addUserMessage(message: string): void {
    this.#messages.push(new Message(MessageAuthor.User, message));
  }

  addAssistantMessage(message: string): void {
    this.#messages.push(new Message(MessageAuthor.Assistant, message));
  }

  getData() {
    return {
      id: this.#id,
      messages: this.#messages.map((message) => message.getData()),
    };
  }

  static fromData(data: any): Conversation {
    return new Conversation(
      data.id,
      data.messages.map((message: any) => Message.fromData(message)),
    );
  }

  toOpenAIFormat(): {
    role: "system" | "user" | "assistant";
    content: string;
  }[] {
    return this.#messages.map((message) => ({
      role:
        message.author === MessageAuthor.System
          ? "system"
          : message.author === MessageAuthor.User
            ? "user"
            : "assistant",
      content: message.content,
    }));
  }
}
