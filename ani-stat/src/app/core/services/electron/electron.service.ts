import { Injectable } from '@angular/core';

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { ipcRenderer, webFrame } from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as util from 'util';
import {
  Observable,
  Subject,
  from,
  map,
  throwError,
  mergeMap,
} from 'rxjs';

const ERROR_NO_ELECTRON = new Error('There is no Electron');

@Injectable({
  providedIn: 'root',
})
export class ElectronService {
  ipcRenderer: typeof ipcRenderer;
  webFrame: typeof webFrame;
  childProcess: typeof childProcess;
  fs: typeof fs;

  constructor() {
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
    if (!this.isElectron) return throwError(() => ERROR_NO_ELECTRON);
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
}
