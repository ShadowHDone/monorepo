import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';

export interface Progress {
  initial: number;
  current: number;
  estimate?: number;
  isLoading: boolean;
  started?: number;
  ended?: number;
}

export type ProgressState = EntityState<Progress, string>;

@Injectable()
@StoreConfig({ name: 'progress' })
export class ProgressStore extends EntityStore<ProgressState> {
  constructor() {
    super({
      count: 0,
      isLoading: false,
    });
  }
}
