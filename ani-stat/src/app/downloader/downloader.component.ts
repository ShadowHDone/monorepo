import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { BehaviorSubject, catchError, of } from 'rxjs';
import { take } from 'rxjs/operators';
import { Anime } from '../../../app/interfaces';
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

  animeList$ = new BehaviorSubject<Anime[]>([]);

  constructor(private electronService: ElectronService) {}

  ngOnInit(): void {}

  updateAnimeList(): void {
    this.electronService
      .getAnimeList()
      .pipe(take(1))
      .subscribe((animeList) => {
        this.animeList$.next(animeList);
      });
  }
}
