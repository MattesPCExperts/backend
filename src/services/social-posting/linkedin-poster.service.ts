export interface LinkedinPostContent {
  text: string;
  media?: string[];
}

export class LinkedinPosterService {
  async createPost(_organizationId: string, _accessToken: string, _content: LinkedinPostContent): Promise<void> {
    throw new Error('LinkedIn posting not implemented.');
  }
}

export const linkedinPosterService = new LinkedinPosterService();

