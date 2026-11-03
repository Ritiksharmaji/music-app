import { io, Socket } from 'socket.io-client';
import { create } from 'zustand';
import { api, errorMessage } from '../api/client';
import { API_ORIGIN } from '../config';
import { Message, User } from '../types';

const socket: Socket = io(API_ORIGIN, { autoConnect: false, transports: ['websocket'] });

interface ChatStore {
  socket: Socket;
  userId: string | null;
  users: User[];
  onlineUsers: Set<string>;
  userActivities: Map<string, string>;
  messages: Message[];
  selectedUser: User | null;
  isLoading: boolean;
  error: string | null;

  connect: (userId: string) => void;
  disconnect: () => void;
  fetchUsers: () => Promise<void>;
  fetchMessages: (userId: string) => Promise<void>;
  setSelectedUser: (user: User | null) => void;
  sendMessage: (receiverId: string, content: string) => void;
  updateActivity: (activity: string) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  socket,
  userId: null,
  users: [],
  onlineUsers: new Set(),
  userActivities: new Map(),
  messages: [],
  selectedUser: null,
  isLoading: false,
  error: null,

  connect: userId => {
    if (get().userId === userId) return;
    set({ userId });

    socket.connect();
    socket.emit('user_connected', userId);

    socket.on('users_online', (users: string[]) => set({ onlineUsers: new Set(users) }));
    socket.on('activities', (activities: [string, string][]) => set({ userActivities: new Map(activities) }));
    socket.on('user_connected', (id: string) =>
      set(state => ({ onlineUsers: new Set([...state.onlineUsers, id]) })),
    );
    socket.on('user_disconnected', (id: string) =>
      set(state => {
        const onlineUsers = new Set(state.onlineUsers);
        onlineUsers.delete(id);
        return { onlineUsers };
      }),
    );
    socket.on('activity_updated', ({ userId: id, activity }: { userId: string; activity: string }) =>
      set(state => ({ userActivities: new Map(state.userActivities).set(id, activity) })),
    );

    // only show messages that belong to the open conversation
    const onMessage = (message: Message) => {
      const selected = get().selectedUser?._id;
      if (selected && (message.senderId === selected || message.receiverId === selected)) {
        set(state => ({ messages: [...state.messages, message] }));
      }
    };
    socket.on('receive_message', onMessage);
    socket.on('message_sent', onMessage);
  },

  disconnect: () => {
    socket.removeAllListeners();
    socket.disconnect();
    set({
      userId: null,
      users: [],
      messages: [],
      selectedUser: null,
      onlineUsers: new Set(),
      userActivities: new Map(),
    });
  },

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/users');
      set({ users: response.data });
    } catch (error) {
      set({ error: errorMessage(error, 'Could not load users') });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMessages: async userId => {
    set({ messages: [] });
    try {
      const response = await api.get(`/users/messages/${userId}`);
      set({ messages: response.data });
    } catch (error) {
      set({ error: errorMessage(error, 'Could not load messages') });
    }
  },

  setSelectedUser: user => set({ selectedUser: user }),

  sendMessage: (receiverId, content) => {
    const senderId = get().userId;
    if (senderId) socket.emit('send_message', { senderId, receiverId, content });
  },

  updateActivity: activity => {
    const userId = get().userId;
    if (userId) socket.emit('update_activity', { userId, activity });
  },
}));
