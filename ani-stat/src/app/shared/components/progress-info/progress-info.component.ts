import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { ProgressQuery } from '../../../downloader/anime-total-list/progress.query';
import { Progress } from '../../../downloader/anime-total-list/progress.store';

@Component({
  selector: 'app-progress-info',
  templateUrl: './progress-info.component.html',
  styleUrls: ['./progress-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressInfoComponent implements OnChanges {
  @Input() stateId = '';
  @Input() total = 0;
  @Input() started = 0;
  @Input() stopped = 0;
  @Input() estimatedCount;
  @Input() rps = 0;
  @Input() rpm = 0;
  @Input() aps = 0;
  @Input() apm = 0;
  @Input() timer$: Observable<number>;

  progressStateId$ = new BehaviorSubject<string>(this.stateId);
  progressState$: Observable<Progress> = this.progressStateId$.pipe(
    switchMap((id) => this.progressQuery.selectEntity(id)),
  );

  constructor(private progressQuery: ProgressQuery) {}

  get isGoing(): boolean {
    return this.started && !this.stopped;
  }

  get isPaused(): boolean {
    return Boolean(this.started && this.stopped);
  }

  get timePassed(): number {
    console.log('timePassed');

    if (!this.started) {
      return 0;
    }

    if (!this.stopped) {
      return Date.now() - this.started;
    }

    return this.stopped - this.started;
  }

  getETA(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if ('stateId' in changes) {
      this.progressStateId$.next(this.stateId);
    }
  }
}
