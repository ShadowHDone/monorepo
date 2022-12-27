import * as Shikimori from 'shikimori-api-node';
import * as fs from 'fs';
import { CONFIG_FILE_NAME } from './consts';
import { AppConfig, Login } from './interfaces';

export class Core {
  shiki: typeof Shikimori;

  // todo rewrite this @$#% to rxjs
  private _appConfig: AppConfig;
  get appConfig(): AppConfig {
    if (!this._appConfig) this._appConfig = this.readAppConfig();
    return this._appConfig;
  }
  set appConfig(config: AppConfig) {
    this._appConfig = { ...this._appConfig, ...config };
  }

  async connectShikimori(): Promise<any> {
    this.shiki = new Shikimori();
    const config = this.appConfig;
    this.shiki.auth.credentials = {
      ...config.login,
    };
    let auth: Login;
    if (config?.login?.refreshtoken) {
      auth = await this.shiki.auth.refreshToken();
    }
    if (!auth.accesstoken) {
      auth = await this.shiki.auth.login({ ...config.login });
    }
    this.appConfig.login = auth;
    this.saveAppConfig();
    return auth;
  }

  saveAppConfig(): void {
    fs.writeFileSync(
      `${__dirname}/${CONFIG_FILE_NAME}`,
      JSON.stringify(this._appConfig)
    );
  }

  private readAppConfig(): AppConfig {
    const raw = fs.readFileSync(`${__dirname}/${CONFIG_FILE_NAME}`, {
      encoding: 'utf8',
    });
    return raw ? JSON.parse(raw) : {};
  }
}
