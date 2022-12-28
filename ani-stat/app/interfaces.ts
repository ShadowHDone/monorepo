export interface Credentials {
  redirecturi?: string;
  clientid?: string;
  clientsecret?: string;
  authcode?: string;
  useragent?: string;
  accesstoken?: string;
  refreshtoken?: string;
  createdat?: number;
  tokenexpiresin?: number;
  scope?: string;
}

export interface AppConfig {
  login?: Credentials;
}

export interface Anime {
  id: number;
  name: string;
  russian: string;
  image: Image;
  url: string;
  kind: string;
  score: string;
  status: string;
  episodes: number;
  episodes_aired: number;
  aired_on: string;
  released_on: string;
}

export interface Image {
  original: string;
  preview: string;
  x96: string;
  x48: string;
}
