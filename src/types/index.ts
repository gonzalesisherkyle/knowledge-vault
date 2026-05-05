export type DocumentStatus = 'queued' | 'processing' | 'ready' | 'failed' | 'deleted';

export interface Document {
  id: string;
  notebookId: string | null;
  filename: string;
  fileType: string;
  status: DocumentStatus;
  totalChunks: number;
  createdAt: string;
  updatedAt: string;
}

export interface Chunk {
  id: string;
  documentId: string;
  content: string;
  metadata: Record<string, any>;
  score?: number;
}

export interface ChatMessage {
  id: string;
  sessionId?: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Chunk[];
  timestamp: string;
}

export interface ChatSession {
  id: string;
  notebookId: string;
  title: string;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Notebook {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'admin' | 'researcher';
export type UserStatus = 'active' | 'inactive';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  groupId?: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface GroupMember {
  id: string;
  userId: string;
  name?: string;
  email?: string;
  role: UserRole;
  status?: UserStatus;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
  meta: {
    requestId: string;
    timestamp: string;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details: unknown;
}

export interface HealthStatus {
  ok: boolean;
  mongo: {
    state: number;
    ok: boolean;
  };
  qdrant: {
    ok: boolean;
    collection: string;
    error?: string;
  };
  openRouter: {
    configured: boolean;
    embeddingModel: string;
    chatModel: string;
  };
}
