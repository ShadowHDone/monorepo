import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { catchError, of } from 'rxjs';
import { take } from 'rxjs/operators';
import { ElectronService } from '../core/services';

@Component({
  selector: 'app-downloader',
  templateUrl: './downloader.component.html',
  styleUrls: ['./downloader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DownloaderComponent implements OnInit {
  fileList$ = this.electronService
    .currentDirectoryList()
    .pipe(catchError((error: Error) => of([error.message])));
  curDir$ = this.electronService
    .currentDirectory()
    .pipe(catchError((error: Error) => of(error.message)));

  constructor(private electronService: ElectronService) {}

  ngOnInit(): void {}

  shikiTest(): void {
    // this.electronService.shikiReload();
    this.electronService
      .shikiGetAnimeLsit()
      .pipe(take(1))
      .subscribe((data) => {
        console.log('shiki-get-anime-list', data);
      });
  }
}
