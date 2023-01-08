import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { BehaviorSubject, catchError, of, switchMap } from 'rxjs';
import { take } from 'rxjs/operators';
import { AnimeSimple } from '../../../app/api/shiki.interface';
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

  animeList$ = new BehaviorSubject<AnimeSimple[]>([]);
  page$ = new BehaviorSubject(1);

  constructor(private electronService: ElectronService) {}

  ngOnInit(): void {
    this.page$
      .pipe(
        switchMap((page) =>
          this.electronService.getAnimes({
            limit: 50,
            order: 'id',
            page,
          })
        )
      )
      .subscribe((animeList) => {
        this.animeList$.next(animeList);
      });
  }

  animeListNext(): void {
    const page = this.page$.getValue();
    this.page$.next(page < 100000 ? page + 1 : page);
  }

  animeListPrevious(): void {
    const page = this.page$.getValue();
    this.page$.next(page > 1 ? page - 1 : page);
  }
}
