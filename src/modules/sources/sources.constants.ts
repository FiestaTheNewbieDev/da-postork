import { Messages } from '@/types';
import { fmt } from '@utils/logger.utils';

export const MESSAGES = {
  newArticlesSaved: (count: number) =>
    `Saved ${fmt.bold(count)} new article(s)`,
  noNewArticles: () => 'No new articles to save',
  enqueuedJobs: (jobCount: number, articleCount: number) =>
    `Enqueued ${fmt.bold(jobCount)} job(s) for ${fmt.bold(articleCount)} article(s)`,
  processJob: (channelId: string, articleIds: number[]) =>
    `Processing job for channel ${fmt.bold(channelId)} with article IDs: ${articleIds.map((id) => fmt.bold(id)).join(', ')}`,
} as const satisfies Messages;

export const ERROR_MESSAGES = {
  channelNotFound: (channelId: string) =>
    `Channel ${fmt.bold(channelId)} not found`,
  channelNotSendable: (channelId: string) =>
    `Channel ${fmt.bold(channelId)} is not sendable`,
  missingEmbedPermissions: (channelId: string) =>
    `Missing permissions to send embeds in channel ${fmt.bold(channelId)}`,
  sendMessageFailed: (channelId: string, articleId: number) =>
    `Failed to send message for article ${fmt.bold(articleId)} in channel ${fmt.bold(channelId)}`,
  cronJobFailed: () => 'Cron job failed',
} as const satisfies Messages;
