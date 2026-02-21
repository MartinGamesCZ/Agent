import { YAML } from "bun";
import { exists, readFile, writeFile } from "fs/promises";
import path from "path";
import type { Logger } from "../utils/Logger";
import { Subagent } from "./Subagent";

interface ISubagentConfig {
  name: string;
  model: string;
  systemPrompt: string;
}

interface IAgentsConfiguration {
  agents: Record<string, ISubagentConfig>;
}

export const defaultAgentsConfiguration: IAgentsConfiguration = {
  agents: {
    project_manager: {
      name: "Project Manager",
      model: "deepseek/deepseek-v3.2",
      systemPrompt:
        "You are an expert Project Manager agent. Your primary role is to analyze user requests, create detailed implementation plans, and break them down into clear, actionable tasks for other specialized agents to execute.",
    },
    programmer: {
      name: "Programmer",
      model: "minimax/minimax-m2.5",
      systemPrompt:
        "You are an expert Programmer agent. Your goal is to write clean, efficient, bug-free, and well-documented code according to the tasks assigned to you. Follow software engineering best practices and ensure your code integrates perfectly with the existing architecture.",
    },
  },
};

export class SubagentManager {
  #agents: Map<string, Subagent> = new Map();
  #logger: Logger;

  static PATH = path.join(process.cwd(), "data/agents.yaml");

  constructor(logger: Logger) {
    this.#logger = logger;
  }

  get agents(): Map<string, Subagent> {
    return this.#agents;
  }

  getAgent(id: string): Subagent | undefined {
    return this.#agents.get(id);
  }

  async init(): Promise<void> {
    this.#logger.log("Initializing SubagentManager...");

    const agentsExists = await this.#exists();

    let config: IAgentsConfiguration;
    if (!agentsExists) {
      this.#logger.log(
        "agents.yaml not found. Creating default configuration...",
      );

      config = defaultAgentsConfiguration;

      await this.#save(config);
    } else {
      config = await this.#load();
    }

    for (const [id, agentConfig] of Object.entries(config.agents || {})) {
      this.#agents.set(
        id,
        new Subagent(
          id,
          agentConfig.name,
          agentConfig.model,
          agentConfig.systemPrompt,
        ),
      );
    }

    this.#logger.log(`Loaded ${this.#agents.size} subagents.`);
  }

  async #exists(): Promise<boolean> {
    return await exists(SubagentManager.PATH);
  }

  async #load(): Promise<IAgentsConfiguration> {
    const file = await readFile(SubagentManager.PATH, "utf-8");
    return YAML.parse(file) as IAgentsConfiguration;
  }

  async #save(config: IAgentsConfiguration): Promise<void> {
    this.#logger.log("Saving agents configuration...");

    const file = YAML.stringify(config, null, 2);
    await writeFile(SubagentManager.PATH, file);

    this.#logger.log("Agents configuration saved.");
  }
}
