import { ReadyEvent } from '@discord/events/client/ready';
import { MessageCreateEvent } from '@discord/events/guild/messageCreate';
import AbstractEvent from '@discord/misc/AbstractEvent';

interface IEvents {
  [key: string]: new (...args: any[]) => AbstractEvent;
}

const EVENTS: IEvents = {
  ready: ReadyEvent,
  messageCreate: MessageCreateEvent,
} as const;

export default EVENTS;
