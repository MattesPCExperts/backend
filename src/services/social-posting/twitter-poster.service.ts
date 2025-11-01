export interface TwitterPostContent {
  status: string;
  mediaIds?: string[];
}

export class TwitterPosterService {
  async createPost(_accountId: string, _accessToken: string, _content: TwitterPostContent): Promise<void> {
    throw new Error('Twitter posting not implemented.');
  }
}

export const twitterPosterService = new TwitterPosterService();

