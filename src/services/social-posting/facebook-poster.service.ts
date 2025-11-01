export interface FacebookPostContent {
  message: string;
  images?: string[];
  link?: string;
}

export class FacebookPosterService {
  async createPost(_pageId: string, _accessToken: string, _content: FacebookPostContent): Promise<void> {
    throw new Error('Facebook posting not implemented.');
  }
}

export const facebookPosterService = new FacebookPosterService();

