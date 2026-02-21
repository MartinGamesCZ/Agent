export class Subagent {
  public readonly id: string;
  public readonly name: string;
  public readonly model: string;
  public readonly systemPrompt: string;

  constructor(id: string, name: string, model: string, systemPrompt: string) {
    this.id = id;
    this.name = name;
    this.model = model;
    this.systemPrompt = systemPrompt;
  }
}
