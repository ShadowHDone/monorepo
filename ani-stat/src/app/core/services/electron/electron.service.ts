import { Injectable } from '@angular/core';

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { ipcRenderer, webFrame } from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import { Observable, Subject, from } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ElectronService {
  private noElectronError = new Error('There is no Electron');
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

  get currentDirectory(): Observable<string> {
    if (!this.isElectron) throw this.noElectronError;
    return from(this.ipcRenderer.invoke('get-patch'));
  }

  get currentDirectoryList(): Observable<string[]> {
    const subject = new Subject<string[]>();
    if (!this.isElectron) {
      subject.error(this.noElectronError);
      return subject;
    }
    this.currentDirectory.subscribe((path) => {
      console.log('path');

      this.fs.readdir(path, function (err, files) {
        if (err) {
          subject.error(err);
        }
        console.log(files);

        subject.next(files);
      });
    });
    return subject;
  }

  get isElectron(): boolean {
    return !!(window && window.process && window.process.type);
  }
}
