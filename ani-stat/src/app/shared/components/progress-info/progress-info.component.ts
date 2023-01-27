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

import { ProgressQuery } from './progress.query';
import { Progress } from './progress.store';
import {
  createDynamicStopwatch,
  TimerDynamicControls,
} from '../../../helpers/stopwatch';

export type ProgressCustomMeasure = {
  name: string;
  description?: string;
  exec: (progress: Progress) => number;
};

@Component({
  selector: 'app-progress-info',
  templateUrl: './progress-info.component.html',
  styleUrls: ['./progress-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressInfoComponent implements OnInit, OnChanges {
  @Input() stateId = '';
  @Input() customMeasures: ProgressCustomMeasure[];
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

  timePassed({ started, ended }: Progress): number {
    if (!started) {
      return 0;
    }

    if (!ended) {
      return Date.now() - started;
    }

    return ended - started;
  }

  countETA(progress: Progress): number {
    const { estimate, current } = progress;

    if (!estimate) {
      return 0;
    }

    const percent = 1 - current / estimate;

    return this.timePassed(progress) * percent;
  }
}
