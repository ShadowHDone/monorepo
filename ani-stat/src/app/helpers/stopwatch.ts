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
import { distinctUntilChanged } from 'rxjs/internal/operators/distinctUntilChanged';

/**
 * start - just continue;
 * pause - stops the timer and you can continue from las position by 'start';
 * stop - stops the timer and refresh the counter;
 * restart - refreshes count value for 0 (the same like 'stop' > 'start")
 *
 * you can also change interval by passing array with format `[command, interval]`
 */
export type TimerControls = 'start' | 'pause' | 'stop' | 'restart';

export type TimerDynamicControls = [TimerControls, number];

export const createStopwatch = (
  control$: Observable<TimerControls>,
  interval = 1000,
) =>
  defer(() => {
    let count = 0;

    const endTicker$ = new Subject<void>();

    const ticker = () =>
      timer(0, interval).pipe(
        takeUntil(endTicker$),
        map(() => count++),
      );

    return control$.pipe(
      tap({
        complete: () => {
          endTicker$.next();
          endTicker$.complete();
        },
        error: () => {
          endTicker$.next();
          endTicker$.complete();
        },
      }),
      distinctUntilChanged(),
      switchMap((command) => {
        endTicker$.next();

        if (command === 'start') {
          return ticker();
        }

        if (command === 'pause') {
          return EMPTY;
        }

        if (command === 'stop') {
          count = 0;
          return EMPTY;
        }

        if (command === 'restart') {
          count = 0;
          return ticker();
        }

        return EMPTY;
      }),
    );
  });

export const createDynamicStopwatch = (
  control$: Observable<TimerDynamicControls>,
) =>
  defer(() => {
    let count = 0;

    const endTicker$ = new Subject<void>();

    const ticker = (interval) =>
      timer(0, interval).pipe(
        takeUntil(endTicker$),
        map(() => (count += interval)),
      );

    return control$.pipe(
      tap({
        complete: () => {
          endTicker$.next();
          endTicker$.complete();
        },
        error: () => {
          endTicker$.next();
          endTicker$.complete();
        },
      }),
      distinctUntilChanged(),
      switchMap(([command, interval]) => {
        endTicker$.next();

        if (command === 'start') {
          return ticker(interval);
        }

        if (command === 'pause') {
          return EMPTY;
        }

        if (command === 'stop') {
          count = 0;
          return EMPTY;
        }

        if (command === 'restart') {
          count = 0;
          return ticker(interval);
        }

        return EMPTY;
      }),
    );
  });
