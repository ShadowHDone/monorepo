import { Component, OnInit } from '@angular/core';
import { ElectronService } from '../../core/services';
import { map } from 'rxjs';
import { TimerControls } from '../../helpers/stopwatch';
import { ProgressStore } from '../../shared/components/progress-info/progress.store';
import { ProgressQuery } from '../../shared/components/progress-info/progress.query';
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
        return (
          ((progress.current - progress.initial) / animesInRequest / takeTime) *
          1000
        );
      },
    },
    {
      name: 'PAGES.DOWNLOADER.PROGRESS.APS',
      description: 'PAGES.DOWNLOADER.PROGRESS.APS_DESC',
      exec: (progress) => {
        const takeTime = (progress.ended || Date.now()) - progress.started;
        return ((progress.current - progress.initial) / takeTime) * 1000;
      },
    },
    {
      name: 'PAGES.DOWNLOADER.PROGRESS.RPM',
      description: 'PAGES.DOWNLOADER.PROGRESS.RPM_DESC',
      exec: (progress) => {
        const takeTime = (progress.ended || Date.now()) - progress.started;
        const animesInRequest = 50;
        return (
          ((progress.current - progress.initial) / animesInRequest / takeTime) *
          1000 *
          60
        );
      },
    },
    {
      name: 'PAGES.DOWNLOADER.PROGRESS.APM',
      description: 'PAGES.DOWNLOADER.PROGRESS.APM_DESC',
      exec: (progress) => {
        const takeTime = (progress.ended || Date.now()) - progress.started;
        return ((progress.current - progress.initial) / takeTime) * 1000 * 60;
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
    this.goGetAnimeInformer$.subscribe(({ requests, animes, status }) => {
      const ended = status === 'end' ? Date.now() : undefined;

      console.log('info,', status);

      this.progressStore.update(ANIME_SIMPLE_PROGRESS_STATE_ID, {
        current: animes,
        ended,
        isLoading: status !== 'end',
      });
    });
  }

  downloadAnime(start: number = 0): void {
    this.progressStore.upsert(ANIME_SIMPLE_PROGRESS_STATE_ID, {
      started: Date.now(),
      isLoading: true,
      initial: start,
      current: start,
      estimate: 4502,
    });

    this.electronService.downloadAnime(start);
  }

  stopDownloadingAnime(): void {
    this.electronService.stopDownloadingAnime();
  }
}
