import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';

import { PageNotFoundComponent } from './components/';
import { WebviewDirective } from './directives/';
import { FormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { LetModule } from '@rx-angular/template/let';
import { ForModule } from '@rx-angular/template/for';
import { IfModule } from '@rx-angular/template/if';
import { PushModule } from '@rx-angular/template/push';
import { UnpatchModule } from '@rx-angular/template/unpatch';

const MATERIAL = [
  MatIconModule,
  MatToolbarModule,
  MatButtonModule,
  MatTabsModule,
  MatCardModule,
  MatProgressBarModule,
  MatTooltipModule,
];

const RX_ANGULAR = [ForModule, LetModule, IfModule, PushModule, UnpatchModule];

@NgModule({
  declarations: [PageNotFoundComponent, WebviewDirective],
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ...MATERIAL,
    ...RX_ANGULAR,
  ],
  exports: [
    TranslateModule,
    WebviewDirective,
    FormsModule,
    ...MATERIAL,
    ...RX_ANGULAR,
  ],
})
export class SharedModule {}
