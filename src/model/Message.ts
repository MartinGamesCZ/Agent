export enum MessageAuthor {
  System = "system",
  User = "user",
  Assistant = "assistant",
}

export class Message {
  #author: MessageAuthor;
  #content: string;

  constructor(author: MessageAuthor, content: string) {
    this.#author = author;
    this.#content = content;
  }

  get author(): MessageAuthor {
    return this.#author;
  }

  get content(): string {
    return this.#content;
  }

  getData() {
    return {
      author: this.#author,
      content: this.#content,
    };
  }

  static fromData(data: any) {
    return new Message(data.author, data.content);
  }
}
