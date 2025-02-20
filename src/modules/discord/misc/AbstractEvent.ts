export default abstract class AbstractEvent {
  public readonly name: string;
  public readonly once: boolean;

  constructor(name: string, once: boolean = true) {
    this.name = name;
    this.once = once;
  }

  public abstract execute(...args: any[]): void | Promise<void>;
}
