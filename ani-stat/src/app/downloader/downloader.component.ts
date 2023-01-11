import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { BehaviorSubject, catchError, of, switchMap } from 'rxjs';
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
  animeList: AnimeSimple[] = [];
  requests = 0;
  rps = 0;
  rpm = 0;
  aps = 0;
  apm = 0;
  started: number;
  page$ = new BehaviorSubject(1);
  goGetAnimeInformer$ = this.electronService.goGetAnimeInformer$;

  constructor(
    private electronService: ElectronService,
    private cd: ChangeDetectorRef
  ) {}

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

    this.electronService.goGetAnimeInformer$.subscribe((animes) => {
      const takeTime = Date.now() - this.started;
      this.animeList = this.animeList.concat(animes);
      this.requests++;
      this.rps = (this.requests / takeTime) * 1000;
      this.rpm = this.rps * 60;
      this.aps = (this.animeList.length / takeTime) * 1000;
      this.apm = this.aps * 60;

      this.cd.detectChanges();
    });
  }

  goGetAnimes(): void {
    if (!this.started) {
      this.started = Date.now();
    }
    this.electronService.goGetAnimes();
  }
}
