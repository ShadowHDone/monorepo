export interface UserConfig {
  login: Login;
}

export interface Login {
  refresh_token?: string;
  create_date?: number;
  token_expires_in?: number;
}

export interface AppConfig {
  redirect_uri?: string;
  client_id?: string;
  client_secret?: string;
  user_agent?: string;
  scope?: string;
}

export interface Anime {
  id: number;
  name: string;
  russian: string;
  image: ImageAnime;
  url: string;
  kind: string;
  score: string;
  status: string;
  episodes: number;
  episodes_aired: number;
  aired_on: string;
  released_on: string;
}

export interface UserBrief {
  id: number;
  nickname: string;
  avatar: string;
  image: ImageUser;
  last_online_at: Date;
  url: string;
  name?: string;
  sex?: string;
  website?: string;
  birth_on?: Date;
  full_years?: number;
  locale: string;
}

export interface ImageAnime {
  original: string;
  preview: string;
  x96: string;
  x48: string;
}

export interface ImageUser {
  x160: string;
  x148: string;
  x80: string;
  x64: string;
  x48: string;
  x32: string;
  x16: string;
}
