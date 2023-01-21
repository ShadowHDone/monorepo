import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-progress-info',
  templateUrl: './progress-info.component.html',
  styleUrls: ['./progress-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressInfoComponent {
  @Input() total = 0;
  @Input() started = 0;
  @Input() stopped = 0;
  @Input() estimatedCount;
  @Input() rps = 0;
  @Input() rpm = 0;
  @Input() aps = 0;
  @Input() apm = 0;
  @Input() timer$: Observable<number>;

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
}
