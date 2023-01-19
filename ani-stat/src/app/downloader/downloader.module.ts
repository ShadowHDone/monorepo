import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DetailRoutingModule } from './downloader-routing.module';

import { DownloaderComponent } from './downloader.component';
import { SharedModule } from '../shared/shared.module';
import { ProgressInfoModule } from '../shared/components/progress-info/progress-info.module';
import { AnimeTotalListComponent } from './anime-total-list/anime-total-list.component';

@NgModule({
  declarations: [DownloaderComponent, AnimeTotalListComponent],
  imports: [
    CommonModule,
    SharedModule,
    DetailRoutingModule,
    ProgressInfoModule,
  ],
})
export class DownloaderModule {}
