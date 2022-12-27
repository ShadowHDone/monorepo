export interface Login {
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
  login?: Login;
}
