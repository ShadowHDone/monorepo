import * as Store from 'electron-store';
import * as fs from 'fs';
import {
  CONFIG_FILE_NAME,
  ERROR_NO_AUTHCODE,
  ERROR_NO_CLIENTID,
  ERROR_NO_CLIENTSECRET,
  ERROR_NO_REDIRECTURI,
  ERROR_NO_USERAGENT,
} from '../consts';
import { AppConfig } from '../interfaces';
import {
  Observable,
  from,
  tap,
  catchError,
  of,
  switchMap,
  take,
  takeWhile,
  combineLatest,
  BehaviorSubject,
  distinctUntilChanged,
} from 'rxjs';
import { Shiki } from '../api/shiki';
import { AnimeRequest, AnimeSimple } from '../api/shiki.interface';
import { sendDownloadAnimeListInfo } from '../main';
import { Downloader } from './downloader.interface';

export class AnimeSimpleDownloader implements Downloader {
  private animeList: AnimeSimple[] = [];
  private downloader$: BehaviorSubject<number>;

  private current = 0;
  private last = 0;

  constructor(private readonly appConfig: AppConfig) {}

  getAnimeList(request?: AnimeRequest): Observable<AnimeSimple[]> {
    return from(
      Shiki.animes(request, { userAgent: this.appConfig.user_agent }),
    ).pipe(
      tap((list) => {
        console.log('getAnimeList', list);
      }),
      catchError((error) => {
        console.error(error);
        return [];
      }),
    );
  }

  run(first: number = 0, last: number = 0): void {
    this.current = first;
    this.last = last;
    if (this.downloader$) this.downloader$.complete();

    const pageLimit = 50;
    const whenStart = Date.now();
    let animesCount = 0;

    this.downloader$ = new BehaviorSubject(first);
    this.downloader$
      .pipe(
        takeWhile((page) => this.last <= 0 || page < this.last),
        distinctUntilChanged(),
        switchMap((page) => {
          return combineLatest([
            of(page),
            Shiki.animes({ page, limit: pageLimit, order: 'id' }),
          ]);
        }),
        takeWhile(([, animes]) => Boolean(animes.length)),
      )
      .subscribe({
        next: ([page, animes]) => {
          this.saveAnimeList(animes);
          animesCount += animes.length;
          const takeTime = Date.now() - whenStart;

          console.log(
            `${page} page, got ${animesCount} animes (${
              Math.floor((page / takeTime) * 1000 * 60 * 100) / 100
            }rpm)`,
          );

          sendDownloadAnimeListInfo({
            request: page,
            response: animes,
            status: animesCount < pageLimit ? 'warn' : undefined,
          });

          this.downloader$.next(page + 1);
        },
        complete: () => {
          sendDownloadAnimeListInfo({
            status: 'end',
          });
          const takeTime = Date.now() - whenStart;
          console.log(`Job "getting animes" done after ${takeTime}ms `);
        },
      });
  }

  end(last?: number): void {
    if (last !== null || last !== undefined || last < this.current) {
      this.last = last;
      return;
    }

    this.downloader$.complete();
  }

  private saveAnimeList(animes: AnimeSimple[]): void {
    this.animeList = this.animeList.concat(animes);
  }
}
