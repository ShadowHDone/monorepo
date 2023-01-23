import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { ProgressState, ProgressStore } from './progress.store';

@Injectable({ providedIn: 'root' })
export class ProgressQuery extends QueryEntity<ProgressState> {
  constructor(protected store: ProgressStore) {
    super(store);
  }
}
