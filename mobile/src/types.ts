export interface Song {
  _id: string;
  title: string;
  artist: string;
  albumId: string | null;
  imageUrl: string;
  audioUrl: string;
  duration: number;
  createdAt?: string;
  // set for catalog tracks that play through YouTube's embedded player
  source?: 'youtube';
  youtubeId?: string;
  channel?: string;
}

export interface Album {
  _id: string;
  title: string;
  artist: string;
  imageUrl: string;
  releaseYear: number;
  songs: Song[];
}

export interface DiscoverRow {
  id: string;
  name: string;
  group: string;
  songs: Song[];
}

export interface User {
  _id: string;
  fullName: string;
  imageUrl: string;
}

export interface AuthUser extends User {
  email: string;
}

export interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
}
