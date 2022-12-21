import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [ToolbarComponent],
  imports: [CommonModule, SharedModule],
  exports: [ToolbarComponent],
})
export class CoreModule {}
