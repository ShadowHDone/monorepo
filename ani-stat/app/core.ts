import * as Shikimori from 'shikimori-api-node';
import * as Store from 'electron-store';
import * as fs from 'fs';
// import * as fs from 'fs';
import {
  CONFIG_FILE_NAME,
  ERROR_NO_AUTHCODE,
  ERROR_NO_CLIENTID,
  ERROR_NO_CLIENTSECRET,
  ERROR_NO_REDIRECTURI,
  ERROR_NO_USERAGENT,
} from './consts';
import { Anime, AppConfig, UserBrief, UserConfig } from './interfaces';
import { Observable, from, tap, catchError, retry, of, switchMap } from 'rxjs';
import { map } from 'rxjs/internal/operators/map';
import { Mock } from './mock';
import { throwError } from 'rxjs/internal/observable/throwError';

export class Core {
  shiki: typeof Shikimori = new Shikimori();
  mock: Mock;

  private _appConfig: AppConfig;

  /**
   * @todo may be make as consts
   */
  get appConfig(): AppConfig {
    if (!this._appConfig) {
      this._appConfig = this.readAppConfig();
    }
    return this._appConfig;
  }

  constructor(private userConfigStore: Store<UserConfig>) {
    if (process.env.MOCK) {
      console.info('Mock mode is enabled');
      this.mock = new Mock();
    }

    console.log(this.userConfigStore.store);
  }

  private readAppConfig(): AppConfig {
    const raw = fs.readFileSync(`${__dirname}/${CONFIG_FILE_NAME}`, {
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

  getWhoAmI(): Observable<UserBrief> {
    return from(this.shiki.api.users.whoami() as Promise<UserBrief>).pipe(
      switchMap((data) => {
        if (!data) {
          return throwError(() => new Error('No data'));
        }
        return of(data);
      }),
      retry({ count: 1, delay: (error) => this.reAuth(error) }),
      tap((data) => {
        console.log('getWhoAmI', data);
      }),
      catchError((error) => {
        console.error(error);
        return [];
      })
    );
  }

  /**
   * @todo move to static helper
   * @todo make separate error handlers
   * @param error
   * @returns
   */
  private reAuth(error): Observable<unknown> {
    console.warn("Couldn't get message from server", error);
    if (!this.shiki) {
      this.shiki = new Shikimori();
    }
    return of(this.shiki.auth.credentials).pipe(
      switchMap((credentials = {}) => {
        const { clientid, clientsecret, authcode, useragent, redirecturi } =
          credentials;
        if (clientid && clientsecret && authcode && useragent && redirecturi) {
          return of(credentials);
        }
        // todo make appconfig as Subject
        return of(this.appConfig).pipe(
          map((config) => ({ ...credentials, ...config })),
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
          console.info('Refreshing token');
          this.shiki.auth.credentials = credentials;
          return from(this.shiki.auth.refreshToken());
        }
        console.info('Updating auth data');
        return from(this.shiki.auth.login({ ...credentials }));
      })
    );
  }
}
