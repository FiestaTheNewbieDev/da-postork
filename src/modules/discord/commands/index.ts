import AbstractCommand from '@discord/misc/AbstractCommand';

interface ICommands {
  [key: string]: new (...args: any[]) => AbstractCommand;
}

const COMMANDS: ICommands = {} as const;

export default COMMANDS;
