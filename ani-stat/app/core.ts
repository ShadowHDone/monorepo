import * as Shikimori from 'shikimori-api-node';
import * as fs from 'fs/promises';
// import * as fs from 'fs';
import {
  CONFIG_FILE_NAME,
  ERROR_NO_AUTHCODE,
  ERROR_NO_CLIENTID,
  ERROR_NO_CLIENTSECRET,
  ERROR_NO_REDIRECTURI,
  ERROR_NO_USERAGENT,
} from './consts';
import { Anime, AppConfig, Credentials } from './interfaces';
import { Observable, from, tap, catchError, retry, of, switchMap } from 'rxjs';
import { map } from 'rxjs/internal/operators/map';
import { throwError } from 'rxjs/internal/observable/throwError';

export class Core {
  shiki: typeof Shikimori = new Shikimori();

  /**
   * @deprecated will be change to storage
   */
  private _appConfig: AppConfig;

  setAppConfig(config: AppConfig) {
    //todo make recursively
    this._appConfig = { ...this._appConfig, ...config };
  }

  async getAppConfig(): Promise<AppConfig> {
    if (!this._appConfig) this.setAppConfig(await this.readAppConfig());
    return this._appConfig;
  }

  async connectShikimori(): Promise<Credentials> {
    this.shiki = new Shikimori();
    const config = await this.getAppConfig();
    this.shiki.auth.credentials = {
      ...config.login,
    };
    let auth: Credentials;
    if (config?.login?.refreshtoken) {
      console.log('Refresh token');

      // auth = await this.shiki.auth.refreshToken();
      auth = await new Promise((resolve) => {
        resolve({ ...config.login });
      });
    }
    if (!auth.accesstoken) {
      console.log('Reauth');
      // auth = await this.shiki.auth.login({ ...config.login });
      auth = await new Promise((resolve) => {
        resolve({ ...config.login });
      });
    }
    config.login = auth;
    this.setAppConfig(config);
    await this.saveAppConfig();
    return auth;
  }

  async saveAppConfig(): Promise<void> {
    await fs.writeFile(
      `${__dirname}/${CONFIG_FILE_NAME}`,
      JSON.stringify(this._appConfig)
    );
  }

  async test(): Promise<Credentials> {
    return await { accesstoken: 'asdfasdf' };
  }

  private async readAppConfig(): Promise<AppConfig> {
    const raw = await fs.readFile(`${__dirname}/${CONFIG_FILE_NAME}`, {
      encoding: 'utf8',
    });
    return raw ? JSON.parse(raw) : {};
  }

  getAnimeList(): Observable<Anime[]> {
    return from(this.shiki.api.animes.list() as Promise<Anime[]>).pipe(
      retry({ count: 1, delay: this.reAuth }),
      tap((list) => {
        console.log('getAnimeList', list);
      }),
      catchError((error) => {
        console.error(error);
        return [];
      })
    );
  }

  private reAuth(error): Observable<Credentials> {
    console.error("Couldn't get message from server", error);
    if (!this.shiki) {
      this.shiki = new Shikimori();
    }
    return of(this.shiki.auth.credentials as Credentials).pipe(
      switchMap((credentials = {}) => {
        const { clientid, clientsecret, authcode, useragent, redirecturi } =
          credentials;
        if (clientid && clientsecret && authcode && useragent && redirecturi) {
          return of(credentials);
        }
        // todo make appconfig as Subject
        return from(this.readAppConfig()).pipe(
          map((config) => ({ ...credentials, ...config.login })),
          map((credentials) => {
            const { clientid, clientsecret, authcode, useragent, redirecturi } =
              credentials;
            if (!clientid) throw ERROR_NO_CLIENTID;
            if (!clientsecret) throw ERROR_NO_CLIENTSECRET;
            if (!authcode) throw ERROR_NO_AUTHCODE;
            if (!useragent) throw ERROR_NO_USERAGENT;
            if (!redirecturi) throw ERROR_NO_REDIRECTURI;
            return credentials;
          })
        );
      }),
      switchMap((credentials) => {
        const { accesstoken, refreshtoken } = credentials;
        if (accesstoken && refreshtoken) {
          console.log('Refreshing token');
          this.shiki.auth.credentials = credentials;
          return from(this.shiki.auth.refreshToken() as Promise<Credentials>);
        }
        console.log('Updating auth data');
        return from(
          this.shiki.auth.login({ ...credentials }) as Promise<Credentials>
        );
      }),
      switchMap((credentials) => {
        this._appConfig.login = credentials;
        return from(this.saveAppConfig()).pipe(map(() => credentials));
      })
    );
  }
}
