import axios from 'axios';
import type { ApiResponse, Document, Chunk, ChatMessage, HealthStatus, Notebook, ChatSession, User, Group, GroupMember } from '@/types';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api').replace(/\/+$/, '');

type ServerDocument = {
  id: string;
  notebookId?: string | null;
  originalName: string;
  mimeType: string;
  status: Document['status'];
  chunkCount: number;
  createdAt: string;
  updatedAt: string;
};

type ServerSource = {
  chunkId: string;
  documentId: string;
  chunkIndex: number;
  score?: number | null;
  originalName?: string | null;
  mimeType?: string | null;
  text?: string;
};

type ServerChatMessage = {
  id: string;
  sessionId: string;
  role: ChatMessage['role'];
  content: string;
  sources?: ServerSource[];
  createdAt: string;
};

export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('knowledgeVaultToken') || localStorage.getItem('authToken');
  if (token) return { Authorization: `Bearer ${token}` };

  const devUserId = import.meta.env.VITE_DEV_USER_ID;
  return devUserId ? { 'x-user-id': devUserId } : {};
};

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: import.meta.env.VITE_API_WITH_CREDENTIALS === 'true',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  config.headers.set(getAuthHeaders());
  return config;
});

const errorResponse = <T>(error: any): ApiResponse<T> => {
  const data = error?.response?.data;
  if (data?.success === false) return data;

  return {
    success: false,
    data: null,
    error: {
      code: 'NETWORK_ERROR',
      message: error?.message || 'Request failed.',
      details: null,
    },
    meta: {
      requestId: 'client',
      timestamp: new Date().toISOString(),
    },
  };
};

export const errorMessage = (error: ApiResponse<unknown>['error'], fallback: string) =>
  error?.message || fallback;

export const mapDocument = (document: ServerDocument): Document => ({
  id: document.id,
  notebookId: document.notebookId || null,
  filename: document.originalName,
  fileType: document.mimeType,
  status: document.status,
  totalChunks: document.chunkCount,
  createdAt: document.createdAt,
  updatedAt: document.updatedAt,
});

export const mapSource = (source: ServerSource): Chunk => ({
  id: source.chunkId,
  documentId: source.documentId,
  content: source.text || '',
  score: source.score ?? undefined,
  metadata: {
    filename: source.originalName,
    fileType: source.mimeType,
    chunkIndex: source.chunkIndex,
  },
});

export const mapMessage = (m: ServerChatMessage): ChatMessage => ({
  id: m.id,
  sessionId: m.sessionId,
  role: m.role,
  content: m.content,
  sources: m.sources?.map(mapSource) || [],
  timestamp: m.createdAt,
});

export const notebooksApi = {
  list: async (): Promise<ApiResponse<Notebook[]>> => {
    try {
      const { data } = await api.get<ApiResponse<{ notebooks: Notebook[] }>>('/notebooks');
      return { ...data, data: data.data?.notebooks || [] };
    } catch (error) {
      return errorResponse<Notebook[]>(error);
    }
  },
  create: async (payload: { title: string; description?: string }): Promise<ApiResponse<Notebook>> => {
    try {
      const { data } = await api.post<ApiResponse<{ notebook: Notebook }>>('/notebooks', payload);
      return { ...data, data: data.data?.notebook || null };
    } catch (error) {
      return errorResponse<Notebook>(error);
    }
  },
  update: async (id: string, updates: { title?: string; description?: string }): Promise<ApiResponse<Notebook>> => {
    try {
      const { data } = await api.patch<ApiResponse<{ notebook: Notebook }>>(`/notebooks/${id}`, updates);
      return { ...data, data: data.data?.notebook || null };
    } catch (error) {
      return errorResponse<Notebook>(error);
    }
  },
  delete: async (id: string): Promise<ApiResponse<{ id: string }>> => {
    try {
      const { data } = await api.delete<ApiResponse<{ notebook: { id: string } }>>(`/notebooks/${id}`);
      return { ...data, data: data.data ? { id: data.data.notebook.id } : null };
    } catch (error) {
      return errorResponse<{ id: string }>(error);
    }
  },
};

export const docsApi = {
  upload: async (file: File, notebookId: string): Promise<ApiResponse<Document>> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('notebookId', notebookId);
      const { data } = await axios.post<ApiResponse<{ document: ServerDocument }>>(
        `${API_BASE_URL}/docs/upload`,
        formData,
        {
          withCredentials: import.meta.env.VITE_API_WITH_CREDENTIALS === 'true',
          headers: {
            ...getAuthHeaders(),
          },
        }
      );
      return { ...data, data: data.data ? mapDocument(data.data.document) : null };
    } catch (error) {
      return errorResponse<Document>(error);
    }
  },
  list: async (notebookId?: string): Promise<ApiResponse<Document[]>> => {
    try {
      const { data } = await api.get<ApiResponse<{ documents: ServerDocument[] }>>('/docs', {
        params: { notebookId }
      });
      return { ...data, data: data.data ? data.data.documents.map(mapDocument) : [] };
    } catch (error) {
      return errorResponse<Document[]>(error);
    }
  },
  getChunks: async (id: string): Promise<ApiResponse<Chunk[]>> => {
    try {
      const { data } = await api.get<ApiResponse<{ chunks: Array<{ id: string; documentId: string; text: string; metadata: Record<string, any> }> }>>(`/docs/${id}/chunks`);
      return {
        ...data,
        data: data.data
          ? data.data.chunks.map((chunk) => ({
              id: chunk.id,
              documentId: chunk.documentId,
              content: chunk.text,
              metadata: chunk.metadata,
            }))
          : [],
      };
    } catch (error) {
      return errorResponse<Chunk[]>(error);
    }
  },
  delete: async (id: string): Promise<ApiResponse<{ id: string }>> => {
    try {
      const { data } = await api.delete<ApiResponse<{ document: { id: string } }>>(`/docs/${id}`);
      return { ...data, data: data.data ? { id: data.data.document.id } : null };
    } catch (error) {
      return errorResponse<{ id: string }>(error);
    }
  },
};

export const chatApi = {
  listSessions: async (notebookId: string): Promise<ApiResponse<ChatSession[]>> => {
    try {
      const { data } = await api.get<ApiResponse<{ sessions: ChatSession[] }>>('/chat/sessions', {
        params: { notebookId }
      });
      return { ...data, data: data.data?.sessions || [] };
    } catch (error) {
      return errorResponse<ChatSession[]>(error);
    }
  },
  createSession: async (notebookId: string, title?: string): Promise<ApiResponse<ChatSession>> => {
    try {
      const { data } = await api.post<ApiResponse<{ session: ChatSession }>>('/chat/sessions', { notebookId, title });
      return { ...data, data: data.data?.session || null };
    } catch (error) {
      return errorResponse<ChatSession>(error);
    }
  },
  getSessionMessages: async (sessionId: string): Promise<ApiResponse<{ session: ChatSession; messages: ChatMessage[] }>> => {
    try {
      const { data } = await api.get<ApiResponse<{ session: ChatSession; messages: ServerChatMessage[] }>>(`/chat/sessions/${sessionId}/messages`);
      return { 
        ...data, 
        data: data.data ? {
          session: data.data.session,
          messages: data.data.messages.map(mapMessage)
        } : null 
      };
    } catch (error) {
      return errorResponse<{ session: ChatSession; messages: ChatMessage[] }>(error);
    }
  },
  deleteSession: async (sessionId: string): Promise<ApiResponse<{ id: string }>> => {
    try {
      const { data } = await api.delete<ApiResponse<{ session: { id: string } }>>(`/chat/sessions/${sessionId}`);
      return { ...data, data: data.data ? { id: data.data.session.id } : null };
    } catch (error) {
      return errorResponse<{ id: string }>(error);
    }
  },
  send: async (message: string, notebookId: string, sessionId?: string): Promise<ApiResponse<ChatMessage>> => {
    try {
      const { data } = await api.post<ApiResponse<{ answer: string; sources: ServerSource[] }>>('/chat', { 
        question: message,
        notebookId,
        sessionId
      });
      return {
        ...data,
        data: data.data
          ? {
              id: Date.now().toString(),
              sessionId: sessionId,
              role: 'assistant',
              content: data.data.answer,
              sources: data.data.sources.map(mapSource),
              timestamp: new Date().toISOString(),
            }
          : null,
      };
    } catch (error) {
      return errorResponse<ChatMessage>(error);
    }
  },
};

export const healthApi = {
  getRagHealth: async (): Promise<ApiResponse<HealthStatus>> => {
    try {
      const { data } = await api.get<ApiResponse<HealthStatus>>('/health/rag');
      return data;
    } catch (error) {
      return errorResponse<HealthStatus>(error);
    }
  },
};

export const usersApi = {
  list: async (): Promise<ApiResponse<User[]>> => {
    try {
      const { data } = await api.get<ApiResponse<User[]>>('/users');
      return data;
    } catch (error) {
      return errorResponse<User[]>(error);
    }
  },
  create: async (userData: { name: string; email: string; role: string }): Promise<ApiResponse<User>> => {
    try {
      const { data } = await api.post<ApiResponse<User>>('/users', userData);
      return data;
    } catch (error) {
      return errorResponse<User>(error);
    }
  },
  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    try {
      const { data } = await api.delete<ApiResponse<{ message: string }>>(`/users/${id}`);
      return data;
    } catch (error) {
      return errorResponse<{ message: string }>(error);
    }
  },
};

export const authApi = {
  register: async (userData: any): Promise<ApiResponse<{ user: User; token: string }>> => {
    try {
      const { data } = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/register', userData);
      return data;
    } catch (error) {
      return errorResponse<{ user: User; token: string }>(error);
    }
  },
  login: async (credentials: any): Promise<ApiResponse<{ user: User; token: string }>> => {
    try {
      const { data } = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', credentials);
      return data;
    } catch (error) {
      return errorResponse<{ user: User; token: string }>(error);
    }
  },
  me: async (): Promise<ApiResponse<{ user: User }>> => {
    try {
      const { data } = await api.get<ApiResponse<{ user: User }>>('/auth/me');
      return data;
    } catch (error) {
      return errorResponse<{ user: User }>(error);
    }
  },
};

export const groupsApi = {
  getCurrent: async (): Promise<ApiResponse<Group>> => {
    try {
      const { data } = await api.get<ApiResponse<{ group: Group }>>('/groups/current');
      return { ...data, data: data.data?.group || null };
    } catch (error) {
      return errorResponse<Group>(error);
    }
  },
  listMembers: async (groupId: string): Promise<ApiResponse<GroupMember[]>> => {
    try {
      const { data } = await api.get<ApiResponse<{ members: GroupMember[] }>>(`/groups/${groupId}/members`);
      return { ...data, data: data.data?.members || [] };
    } catch (error) {
      return errorResponse<GroupMember[]>(error);
    }
  },
  addMember: async (groupId: string, memberData: { name: string; email: string; role: string; password?: string }): Promise<ApiResponse<GroupMember>> => {
    try {
      const { data } = await api.post<ApiResponse<{ member: GroupMember }>>(`/groups/${groupId}/members`, memberData);
      return { ...data, data: data.data?.member || null };
    } catch (error) {
      return errorResponse<GroupMember>(error);
    }
  },
  removeMember: async (groupId: string, memberId: string): Promise<ApiResponse<{ message: string }>> => {
    try {
      const { data } = await api.delete<ApiResponse<{ message: string }>>(`/groups/${groupId}/members/${memberId}`);
      return data;
    } catch (error) {
      return errorResponse<{ message: string }>(error);
    }
  },
};

export default api;
