export type SourceJobData = {
  channelId: string;
  articleIds: number[];
};

export type CronSchedule = {
  expression: string;
  timezone: string;
};
