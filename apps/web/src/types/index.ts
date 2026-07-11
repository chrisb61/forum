export type Role = 'GUEST' | 'MEMBER' | 'TRUSTED_MEMBER' | 'MODERATOR' | 'ADMINISTRATOR';
export type ThreadStatus = 'OPEN' | 'LOCKED' | 'ARCHIVED' | 'DELETED';
export type ThreadType = 'STANDARD' | 'POLL' | 'QUESTION' | 'ANNOUNCEMENT';
export type ReactionType = 'LIKE' | 'HELPFUL' | 'INSIGHTFUL' | 'FUNNY';

export interface User {
  id: string;
  username: string;
  email?: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  role: Role;
  memberType?: 'PROFESSIONAL' | 'STUDENT' | 'CORPORATE';
  reputation: number;
  postCount: number;
  isEmailVerified?: boolean;
  createdAt: string;
  badges?: UserBadge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
}

export interface UserBadge {
  badge: Badge;
  awardedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
  forums: Forum[];
}

export interface Forum {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  slug: string;
  threadCount: number;
  postCount: number;
  isPrivate: boolean;
}

export interface Thread {
  id: string;
  forumId: string;
  authorId: string;
  title: string;
  slug: string;
  status: ThreadStatus;
  type: ThreadType;
  isPinned: boolean;
  viewCount: number;
  replyCount: number;
  lastPostAt?: string;
  createdAt: string;
  author: Pick<User, 'id' | 'username' | 'displayName' | 'avatar' | 'role'>;
  forum?: Forum & { category?: Category };
  tags?: ThreadTag[];
  _count?: { posts: number; bookmarks?: number };
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  color?: string;
}

export interface ThreadTag {
  tag: Tag;
}

export interface Post {
  id: string;
  threadId: string;
  authorId: string;
  content: string;
  isDeleted: boolean;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  author: Pick<User, 'id' | 'username' | 'displayName' | 'avatar' | 'role' | 'reputation' | 'postCount'>;
  reactions?: Reaction[];
  _count?: { reactions: number };
}

export interface Reaction {
  id: string;
  userId: string;
  postId: string;
  type: ReactionType;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  payload: Record<string, any>;
  readAt?: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}
