import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { startWith, switchMap, filter } from 'rxjs/operators';

import { ProgressQuery } from '../../../downloader/anime-total-list/progress.query';
import { Progress } from '../../../downloader/anime-total-list/progress.store';
import {
  createDynamicStopwatch,
  TimerDynamicControls,
} from '../../../helpers/stopwatch';

@Component({
  selector: 'app-progress-info',
  templateUrl: './progress-info.component.html',
  styleUrls: ['./progress-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressInfoComponent implements OnInit, OnChanges {
  @Input() stateId = '';
  @Input() total = 0;
  @Input() started = 0;
  @Input() stopped = 0;
  @Input() estimatedCount;
  @Input() rps = 0;
  @Input() rpm = 0;
  @Input() aps = 0;
  @Input() apm = 0;
  @Input() refreshInterval = 500;

  progressStateId$ = new BehaviorSubject<string>(this.stateId);
  progressState$: Observable<Progress> = this.progressStateId$.pipe(
    switchMap((id) => this.progressQuery.selectEntity(id)),
  );

  timerController$ = new BehaviorSubject<TimerDynamicControls>([
    'stop',
    this.refreshInterval,
  ]);
  timer$ = createDynamicStopwatch(this.timerController$).pipe(startWith(0));

  constructor(private progressQuery: ProgressQuery) {}

  get isGoing(): boolean {
    return this.started && !this.stopped;
  }

  get isPaused(): boolean {
    return Boolean(this.started && this.stopped);
  }

  timePassed({ started, paused }: Progress): number {
    if (!started) {
      return 0;
    }

    if (!paused) {
      return Date.now() - started;
    }

    return paused - started;
  }

  ngOnInit(): void {
    this.progressState$.pipe(filter(Boolean)).subscribe(({ isLoading }) => {
      this.timerController$.next([
        isLoading ? 'start' : 'stop',
        this.refreshInterval,
      ]);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('stateId' in changes) {
      this.progressStateId$.next(this.stateId);
    }

    if ('refreshInterval' in changes) {
      const timerControllerValue = this.timerController$.getValue();
      const timerCommand =
        typeof timerControllerValue === 'object'
          ? timerControllerValue[0]
          : timerControllerValue;
      if (timerCommand === 'start') {
        this.timerController$.next(['start', this.refreshInterval]);
      }
    }
  }

  countETA(progress: Progress): number {
    const { count, estimateCount } = progress;
    if (!estimateCount) {
      return 0;
    }

    const percent = 1 - count / estimateCount;

    return this.timePassed(progress) * percent;
  }
}
