import { Component, OnInit } from '@angular/core';
import { ElectronService } from '../../core/services';
import { map } from 'rxjs';
import { TimerControls } from '../../helpers/stopwatch';
import { ProgressStore } from './progress.store';
import { ProgressQuery } from './progress.query';
import { ProgressCustomMeasure } from '../../shared/components/progress-info/progress-info.component';

const ANIME_SIMPLE_PROGRESS_STATE_ID = 'anime-simple-progress-state-id';

@Component({
  selector: 'app-anime-total-list',
  templateUrl: './anime-total-list.component.html',
  styleUrls: ['./anime-total-list.component.scss'],
})
export class AnimeTotalListComponent implements OnInit {
  readonly progressId = ANIME_SIMPLE_PROGRESS_STATE_ID;
  readonly measures: ProgressCustomMeasure[] = [
    {
      name: 'PAGES.DOWNLOADER.PROGRESS.RPS',
      description: 'PAGES.DOWNLOADER.PROGRESS.RPS_DESC',
      exec: (progress) => {
        const takeTime = (progress.ended || Date.now()) - progress.started;
        const animesInRequest = 50;
        return (progress.count / animesInRequest / takeTime) * 1000;
      },
    },
    {
      name: 'PAGES.DOWNLOADER.PROGRESS.APS',
      description: 'PAGES.DOWNLOADER.PROGRESS.APS_DESC',
      exec: (progress) => {
        const takeTime = (progress.ended || Date.now()) - progress.started;
        return (progress.count / takeTime) * 1000;
      },
    },
    {
      name: 'PAGES.DOWNLOADER.PROGRESS.RPM',
      description: 'PAGES.DOWNLOADER.PROGRESS.RPM_DESC',
      exec: (progress) => {
        const takeTime = (progress.ended || Date.now()) - progress.started;
        const animesInRequest = 50;
        return (progress.count / animesInRequest / takeTime) * 1000 * 60;
      },
    },
    {
      name: 'PAGES.DOWNLOADER.PROGRESS.APM',
      description: 'PAGES.DOWNLOADER.PROGRESS.APM_DESC',
      exec: (progress) => {
        const takeTime = (progress.ended || Date.now()) - progress.started;
        return (progress.count / takeTime) * 1000 * 60;
      },
    },
  ];
  goGetAnimeInformer$ = this.electronService.goGetAnimeInformer$;

  storeCount: number;
  storeCount$ = this.progressQuery.selectEntity(ANIME_SIMPLE_PROGRESS_STATE_ID);

  constructor(
    private electronService: ElectronService,
    private progressStore: ProgressStore,
    private progressQuery: ProgressQuery,
  ) {}

  ngOnInit(): void {
    this.goGetAnimeInformer$.subscribe(({ requests, animes: count, status }) => {
      const ended = status === 'end' ? Date.now() : undefined;
      this.progressStore.update(ANIME_SIMPLE_PROGRESS_STATE_ID, {
        count,
        ended,
        isLoading: status !== 'end',
      });
    });
  }

  downloadAnimes(command: TimerControls): void {
    if (command === 'start') {
      console.log('started');

      this.progressStore.upsert(ANIME_SIMPLE_PROGRESS_STATE_ID, {
        started: Date.now(),
        loadingState: true,
        paused: null,
        estimateCount: 4502,
      });

      this.electronService.downloadAnimes('start');
    }

    if (command === 'stop') {
      console.log('stopped');

      this.progressStore.update(ANIME_SIMPLE_PROGRESS_STATE_ID, {
        ended: Date.now(),
        isLoading: false,
      });

      this.electronService.downloadAnimes('pause');
    }
  }
}
