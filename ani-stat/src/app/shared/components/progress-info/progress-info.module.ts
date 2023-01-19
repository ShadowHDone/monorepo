import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressInfoComponent } from './progress-info.component';
import { SharedModule } from '../../shared.module';

@NgModule({
  declarations: [ProgressInfoComponent],
  imports: [CommonModule, SharedModule],
  exports: [ProgressInfoComponent],
})
export class ProgressInfoModule {}
