export interface InstagramPostContent {
  caption: string;
  mediaUrls?: string[];
}

export class InstagramPosterService {
  async createPost(_businessAccountId: string, _accessToken: string, _content: InstagramPostContent): Promise<void> {
    throw new Error('Instagram posting not implemented.');
  }
}

export const instagramPosterService = new InstagramPosterService();

