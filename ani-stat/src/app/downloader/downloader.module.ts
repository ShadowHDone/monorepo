import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DetailRoutingModule } from './downloader-routing.module';

import { DownloaderComponent } from './downloader.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [DownloaderComponent],
  imports: [CommonModule, SharedModule, DetailRoutingModule],
})
export class DownloaderModule {}
