import {
  defer,
  EMPTY,
  map,
  Observable,
  Subject,
  switchMap,
  takeUntil,
  tap,
  timer,
} from 'rxjs';

export type TimerController = 'start' | 'stop' | 'reset';

export const createStopwatch = (
  control$: Observable<TimerController>,
  interval = 1000,
) =>
  defer(() => {
    let toggle = false;
    let count = 0;

    const endTicker$ = new Subject();

    const ticker = () =>
      timer(0, interval).pipe(
        takeUntil(endTicker$),
        map(() => count++),
      );

    return control$.pipe(
      tap({
        complete: () => {
          endTicker$.next(null);
          endTicker$.complete();
        },
        error: () => {
          endTicker$.next(null);
          endTicker$.complete();
        },
      }),
      switchMap((command) => {
        if (command === 'start' && !toggle) {
          toggle = true;
          return ticker();
        }

        if (command === 'stop' && toggle) {
          toggle = false;
          return EMPTY;
        }

        if (command === 'reset') {
          count = 0;
          if (toggle) {
            return ticker();
          }
        }

        return EMPTY;
      }),
    );
  });
