import { CommandInteraction, Message } from 'discord.js';

type Option = {
  name: string;
  description: string;
  required: boolean;
  type: number;
};

export default abstract class AbstractCommand {
  public readonly name: string;
  public readonly description: string;
  public readonly options?: Option[];

  constructor(name: string, description: string, options?: Option[]) {
    this.name = name;
    this.description = description;
    this.options = options || [];
  }

  public abstract execute(
    message: Message,
    ...args: any[]
  ): void | Promise<void>;
  public abstract executeInteraction(
    interaction: CommandInteraction,
    ...args: any[]
  ): void | Promise<void>;
}
