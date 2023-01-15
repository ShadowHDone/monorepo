import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { BehaviorSubject, catchError, of, map, startWith } from 'rxjs';
import { AnimeSimple } from '../../../app/api/shiki.interface';
import { ElectronService } from '../core/services';
import { TimerController, createStopwatch } from '../helpers/stopwatch';

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

  animeCount = 0;
  rps = 0;
  rpm = 0;
  aps = 0;
  apm = 0;
  started: number;
  stopped: number;
  goGetAnimeInformer$ = this.electronService.goGetAnimeInformer$;

  timerController$ = new BehaviorSubject<TimerController>('stop');
  timer$ = createStopwatch(this.timerController$).pipe(
    startWith(0),
    map((time) => time * 1000),
  );

  constructor(
    private electronService: ElectronService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.electronService.goGetAnimeInformer$.subscribe(
      ({ requests, animes, status }) => {
        const takeTime = Date.now() - this.started;
        this.animeCount = animes;
        this.rps = (requests / takeTime) * 1000;
        this.rpm = this.rps * 60;
        this.aps = (animes / takeTime) * 1000;
        this.apm = this.aps * 60;

        if (status === 'end') {
          this.timerController$.next('stop');
        }
      },
    );
  }

  downloadAnimes(command: TimerController): void {
    this.timerController$.next(command);
    if (command === 'start') {
      this.started = Date.now();
      this.electronService.downloadAnimes('start');
    }

    if (command === 'stop') {
      this.stopped = Date.now();
      this.electronService.downloadAnimes('pause');
    }
  }
}
