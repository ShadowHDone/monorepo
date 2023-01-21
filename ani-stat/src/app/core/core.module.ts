import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';
import { ElectronService } from './services';

@NgModule({
  declarations: [ToolbarComponent],
  imports: [CommonModule, SharedModule, RouterModule],
  exports: [ToolbarComponent],
  providers: [ElectronService]
})
export class CoreModule {}
