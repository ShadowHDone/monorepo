import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { ElectronService } from '../../core/services';
import { BehaviorSubject, map, startWith } from 'rxjs';
import { AnimeSimple } from '../../../../app/api/shiki.interface';
import { createStopwatch, TimerControls } from '../../helpers/stopwatch';
import { timer } from 'rxjs/internal/observable/timer';
import { ProgressStore } from './progress.store';
import { ProgressQuery } from './progress.query';

const ANIME_SIMPLE_PROGRESS_STATE_ID = 'anime-simple-progress-state-id';

@Component({
  selector: 'app-anime-total-list',
  templateUrl: './anime-total-list.component.html',
  styleUrls: ['./anime-total-list.component.scss'],
})
export class AnimeTotalListComponent implements OnInit {
  readonly progressId = ANIME_SIMPLE_PROGRESS_STATE_ID;
  animeCount = 0;
  rps = 0;
  rpm = 0;
  aps = 0;
  apm = 0;
  started = 0;
  stopped = 0;
  goGetAnimeInformer$ = this.electronService.goGetAnimeInformer$.pipe(
    map((value) => this.zone.run(() => value)),
  );

  storeCount: number;
  storeCount$ = this.progressQuery.selectEntity(ANIME_SIMPLE_PROGRESS_STATE_ID);

  constructor(
    private electronService: ElectronService,
    private cd: ChangeDetectorRef,
    private zone: NgZone,
    private progressStore: ProgressStore,
    private progressQuery: ProgressQuery,
  ) {}

  ngOnInit(): void {
    this.goGetAnimeInformer$.subscribe(({ requests, animes, status }) => {
      const takeTime = Date.now() - this.started;
      this.animeCount = animes;

      if (status !== 'end') {
        this.rps = (requests / takeTime) * 1000;
        this.rpm = this.rps * 60;
        this.aps = (animes / takeTime) * 1000;
        this.apm = this.aps * 60;
      }

      this.progressStore.update(ANIME_SIMPLE_PROGRESS_STATE_ID, {
        count: animes,
        isLoading: status !== 'end',
      });
    });

    // this.timer$.subscribe(() => {
    //   console.log('check');

    //   // костыль чтобы обновлялся таймер
    //   this.cd.markForCheck();
    //   this.cd.detectChanges();
    // });
  }

  downloadAnimes(command: TimerControls): void {
    if (command === 'start') {
      console.log('started');

      this.progressStore.upsert(ANIME_SIMPLE_PROGRESS_STATE_ID, {
        started: Date.now(),
        loadingState: true,
        paused: null,
        estimateCount: 502,
      });

      this.started = Date.now() - (this.stopped - this.started);
      this.stopped = 0;
      this.electronService.downloadAnimes('start');
    }

    if (command === 'stop') {
      console.log('stopped');

      this.progressStore.update(ANIME_SIMPLE_PROGRESS_STATE_ID, {
        paused: Date.now(),
        isLoading: false,
      });

      this.stopped = Date.now();
      this.electronService.downloadAnimes('pause');
    }
  }
}
