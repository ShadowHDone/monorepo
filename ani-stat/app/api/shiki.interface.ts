export interface ShikiConfig {
  apiUrl?: string;
  userAgent?: string;
  accessToken?: string;
}

export type SimpleRate = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface AnimeRequest {
  page?: number;
  limit?: number;
  order?:
    | 'id'
    | 'id_desc'
    | 'ranked'
    | 'kind'
    | 'popularity'
    | 'name'
    | 'aired_on'
    | 'episodes'
    | 'status'
    | 'random'
    | 'ranked_random'
    | 'ranked_shiki'
    | 'created_at'
    | 'created_at_desc.';
  type?: unknown;
  kind?:
    | 'tv'
    | 'movie'
    | 'ova'
    | 'ona'
    | 'special'
    | 'music'
    | 'tv_13'
    | 'tv_24'
    | 'tv_48';
  status?: 'anons' | 'ongoing' | 'released';
  season?: string;
  score?: number;
  duration?: 'S' | 'D' | 'F';
  rating?: 'none' | 'g' | 'pg' | 'pg_13' | 'r' | 'r_plus' | 'rx';
  genre?: string;
  studio?: string;
  franchise?: string;
  censored?: 'true' | 'boolean.';
  mylist?:
    | 'planned'
    | 'watching'
    | 'rewatching'
    | 'completed'
    | 'on_hold'
    | 'dropped';
  ids?: string;
  exclude_ids?: string;
  search?: string;
}

export interface AnimeSimple {
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

export interface Anime extends AnimeSimple {
  rating: string;
  english: string[];
  japanese: string[];
  synonyms: string[];
  license_name_ru: string;
  duration: number;
  description: string;
  description_html: string;
  description_source: string;
  franchise: string;
  favoured: boolean;
  anons: boolean;
  ongoing: boolean;
  thread_id: number;
  topic_id: number;
  myanimelist_id: number;
  rates_scores_stats: RatesScoresStats[];
  rates_statuses_stats: RatesStatusesStats[];
  updated_at: Date;
  next_episode_at: Date;
  fansubbers: string[];
  fandubbers: string[];
  licensors: string[];
  genres: Genre[];
  studios: Studio[];
  videos: Video[];
  screenshots: Screenshot[];
  user_rate: SimpleRate;
}

export interface RatesScoresStats {
  name: SimpleRate;
  value: number;
}

export interface RatesStatusesStats {
  name: 'Запланировано' | 'Просмотрено' | 'Смотрю' | 'Брошено' | 'Отложено';
  value: number;
}

export interface Genre {
  id: number;
  name: string;
  russian: string;
  kind: 'anime' | 'manga';
}

export interface Studio {
  id: 18;
  name: string;
  filtered_name: string;
  real: boolean;
  image: string;
}

export interface Video {
  id: number;
  url: string;
  image_url: string;
  player_url: string;
  name: string;
  kind: string;
  hosting: string;
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

export interface Screenshot {
  original: string;
  preview: string;
}
