import { NgModule } from '@angular/core';
import { ProgressQuery } from '../shared/components/progress-info/progress.query';
import { ProgressStore } from '../shared/components/progress-info/progress.store';

const STORES = [ProgressStore];
const QUERYS = [ProgressQuery];
@NgModule({
  providers: [...STORES, ...QUERYS],
})
export class CoreStoresModule {}
