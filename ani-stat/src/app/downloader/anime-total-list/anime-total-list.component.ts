import { Component, OnInit } from '@angular/core';
import { ElectronService } from '../../core/services';
import { map } from 'rxjs';
import { TimerControls } from '../../helpers/stopwatch';
import {
  Progress,
  ProgressStore,
} from '../../shared/components/progress-info/progress.store';
import { ProgressQuery } from '../../shared/components/progress-info/progress.query';
import { ProgressCustomMeasure } from '../../shared/components/progress-info/progress-info.component';

const ANIME_SIMPLE_PROGRESS_STATE_ID = 'anime-simple-progress-state-id';

const ANIME_PER_REQUEST = 50;

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
      exec: AnimeTotalListComponent.requestsMeasure,
    },
    {
      name: 'PAGES.DOWNLOADER.PROGRESS.APS',
      description: 'PAGES.DOWNLOADER.PROGRESS.APS_DESC',
      exec: AnimeTotalListComponent.animesMeasure,
    },
    {
      name: 'PAGES.DOWNLOADER.PROGRESS.RPM',
      description: 'PAGES.DOWNLOADER.PROGRESS.RPM_DESC',
      exec: (progress) =>
        AnimeTotalListComponent.requestsMeasure(progress) * 60,
    },
    {
      name: 'PAGES.DOWNLOADER.PROGRESS.APM',
      description: 'PAGES.DOWNLOADER.PROGRESS.APM_DESC',
      exec: (progress) => AnimeTotalListComponent.animesMeasure(progress) * 60,
    },
  ];
  downloaderAnimeShikiInfo$ = this.electronService.downloaderAnimeShikiInfo$;

  storeProgress$ = this.progressQuery.selectEntity(
    ANIME_SIMPLE_PROGRESS_STATE_ID,
  );

  constructor(
    private electronService: ElectronService,
    private progressStore: ProgressStore,
    private progressQuery: ProgressQuery,
  ) {}

  static readonly requestsMeasure = (progress: Progress) => {
    const takeTime = (progress.ended || Date.now()) - progress.started;
    return (
      ((progress.current - progress.initial) / ANIME_PER_REQUEST / takeTime) *
      1000
    );
  };

  static readonly animesMeasure = (progress: Progress) => {
    const takeTime = (progress.ended || Date.now()) - progress.started;
    return ((progress.current - progress.initial) / takeTime) * 1000;
  };

  ngOnInit(): void {
    this.downloaderSub();
  }

  downloadAnime(animes: number = 0): void {
    this.progressStore.upsert(ANIME_SIMPLE_PROGRESS_STATE_ID, {
      started: Date.now(),
      isLoading: true,
      initial: animes,
      current: animes,
      estimate: 4502,
    });

    this.electronService.downloadAnime(Math.ceil(animes / ANIME_PER_REQUEST));
  }

  stopDownloadingAnime(): void {
    this.electronService.stopDownloadingAnime();
  }

  private downloaderSub(): void {
    this.downloaderAnimeShikiInfo$.subscribe(({ response, status }) => {
      const ended = status === 'end' ? Date.now() : undefined;
      const current =
        this.progressQuery.getEntity(ANIME_SIMPLE_PROGRESS_STATE_ID).current +
        (response?.length || 0);

      console.log('info,', status);

      this.progressStore.update(ANIME_SIMPLE_PROGRESS_STATE_ID, {
        current,
        ended,
        isLoading: status !== 'end',
      });
    });
  }
}
