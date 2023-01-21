import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { ElectronService } from '../../core/services';
import { BehaviorSubject, map, startWith } from 'rxjs';
import { AnimeSimple } from '../../../../app/api/shiki.interface';
import { createStopwatch, TimerController } from '../../helpers/stopwatch';
import { timer } from 'rxjs/internal/observable/timer';

@Component({
  selector: 'app-anime-total-list',
  templateUrl: './anime-total-list.component.html',
  styleUrls: ['./anime-total-list.component.scss'],
})
export class AnimeTotalListComponent implements OnInit {
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

  timerController$ = new BehaviorSubject<TimerController>('stop');
  timer$ = createStopwatch(this.timerController$).pipe(
    startWith(0),
    map((time) => time * 1000),
  );

  constructor(
    private electronService: ElectronService,
    private cd: ChangeDetectorRef,
    private zone: NgZone,
  ) {}

  ngOnInit(): void {
    this.goGetAnimeInformer$.subscribe(({ requests, animes, status }) => {
      const takeTime = Date.now() - this.started;
      this.animeCount = animes;
      this.rps = (requests / takeTime) * 1000;
      this.rpm = this.rps * 60;
      this.aps = (animes / takeTime) * 1000;
      this.apm = this.aps * 60;

      if (status === 'end') {
        this.timerController$.next('stop');
      }
    });

    // this.timer$.subscribe(() => {
    //   console.log('check');

    //   // костыль чтобы обновлялся таймер
    //   this.cd.markForCheck();
    //   this.cd.detectChanges();
    // });
  }

  downloadAnimes(command: TimerController): void {
    this.timerController$.next(command);
    if (command === 'start') {
      console.log('started');

      this.started = Date.now() - (this.stopped - this.started);
      this.stopped = 0;
      this.electronService.downloadAnimes('start');
    }

    if (command === 'stop') {
      console.log('stopped');

      this.stopped = Date.now();
      this.electronService.downloadAnimes('pause');
    }
  }
}
