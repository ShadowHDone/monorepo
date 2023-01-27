import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';
import { ElectronService } from './services';
import { CoreStoresModule } from './core-stores.module';

@NgModule({
  declarations: [ToolbarComponent],
  imports: [CommonModule, SharedModule, RouterModule, CoreStoresModule],
  exports: [ToolbarComponent],
  providers: [ElectronService],
})
export class CoreModule {}
