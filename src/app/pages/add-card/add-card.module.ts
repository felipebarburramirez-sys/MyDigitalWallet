import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AddCardPage } from './add-card.page';
import { AddCardPageRoutingModule } from './add-card-routing.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, IonicModule, SharedModule, AddCardPageRoutingModule],
  declarations: [AddCardPage],
})
export class AddCardPageModule {}
