import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';

export interface Progress {
  count: number;
  isLoading: boolean;
  started?: number;
  paused?: number;
  estimateCount?: number;
}

export type ProgressState = EntityState<Progress, string>;

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'progress' })
export class ProgressStore extends EntityStore<ProgressState> {
  constructor() {
    super({
      count: 0,
      isLoading: false,
    });
  }
}
