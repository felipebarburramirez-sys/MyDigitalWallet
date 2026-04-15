import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { PaymentPage } from './payment.page';
import { PaymentPageRoutingModule } from './payment-routing.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    SharedModule,
    PaymentPageRoutingModule,
  ],
  declarations: [PaymentPage],
})
export class PaymentPageModule {}
