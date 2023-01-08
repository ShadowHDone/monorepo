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
