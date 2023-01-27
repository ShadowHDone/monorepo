import { Injectable, NgZone } from '@angular/core';

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { ipcRenderer, webFrame } from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as util from 'util';
import { Observable, Subject, from, map, throwError, mergeMap } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ERROR_NO_ELECTRON } from './consts';
import {
  AnimeRequest,
  AnimeSimple,
  UserBrief,
} from '../../../../../app/api/shiki.interface';
import { AnimeListInfo } from '../../../../../app/interfaces';

@Injectable()
export class ElectronService {
  ipcRenderer: typeof ipcRenderer;
  webFrame: typeof webFrame;
  childProcess: typeof childProcess;
  fs: typeof fs;
  goGetAnimeInformer$ = new Subject<AnimeListInfo>();

  constructor(private zone: NgZone) {
    // Conditional imports
    if (this.isElectron) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.webFrame = window.require('electron').webFrame;

      this.fs = window.require('fs');

      this.childProcess = window.require('child_process');
      this.childProcess.exec('node -v', (error, stdout, stderr) => {
        if (error) {
          console.error(`error: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
          return;
        }
        console.log(`stdout:\n${stdout}`);
      });

      this.subscribes();

      // Notes :
      // * A NodeJS's dependency imported with 'window.require' MUST BE present in `dependencies` of both `app/package.json`
      // and `package.json (root folder)` in order to make it work here in Electron's Renderer process (src folder)
      // because it will loaded at runtime by Electron.
      // * A NodeJS's dependency imported with TS module import (ex: import { Dropbox } from 'dropbox') CAN only be present
      // in `dependencies` of `package.json (root folder)` because it is loaded during build phase and does not need to be
      // in the final bundle. Reminder : only if not used in Electron's Main process (app folder)

      // If you want to use a NodeJS 3rd party deps in Renderer process,
      // ipcRenderer.invoke can serve many common use cases.
      // https://www.electronjs.org/docs/latest/api/ipc-renderer#ipcrendererinvokechannel-args
    }
  }

  get isElectron(): boolean {
    return !!(window && window.process && window.process.type);
  }

  currentDirectory(): Observable<string> {
    if (!this.isElectron) {
      return throwError(() => ERROR_NO_ELECTRON);
    }
    return from<Promise<string>>(this.ipcRenderer.invoke('get-patch'));
  }

  currentDirectoryList(): Observable<string[]> {
    if (!this.isElectron) {
      const subject = new Subject<string[]>();
      subject.error(ERROR_NO_ELECTRON);
      return subject;
    }
    const readdir = util.promisify(fs.readdir);
    return this.currentDirectory().pipe(
      mergeMap((path) => from(readdir(path, { withFileTypes: true }))),
      map((value) => value.map((dirent) => dirent.name)),
    );
  }

  getAnimes(request: AnimeRequest): Observable<AnimeSimple[]> {
    return from(
      this.ipcRenderer.invoke('shiki-get-animes', request) as Promise<
        AnimeSimple[]
      >,
    ).pipe(
      tap((data) => {
        console.log('shiki-get-animes', data);
      }),
    );
  }

  getWhoAmI(): Observable<UserBrief> {
    return from(
      this.ipcRenderer.invoke('shiki-get-whoami') as Promise<UserBrief>,
    ).pipe(
      tap((data) => {
        console.log('shiki-get-whoami', data);
      }),
    );
  }

  downloadAnime(first?: number, last?: number): void {
    this.ipcRenderer.send('downloader/anime/shiki/start', first, last);
  }

  stopDownloadingAnime(last?: number) {
    this.ipcRenderer.send('downloader/anime/shiki/stop', last);
  }

  subscribes(): void {
    this.ipcRenderer.on(
      'downloader/anime/shiki/info',
      (event, animes: AnimeListInfo) => {
        this.zone.run(() => {
          this.goGetAnimeInformer$.next(animes);
        });
      },
    );
  }
}
