import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-progress-info',
  templateUrl: './progress-info.component.html',
  styleUrls: ['./progress-info.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressInfoComponent {
  @Input() total = 0;
  @Input() rps = 0;
  @Input() rpm = 0;
  @Input() aps = 0;
  @Input() apm = 0;
  @Input() timer$: Observable<number>;
}
