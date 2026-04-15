import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { CardComponent } from './components/card/card.component';
import { TransactionListComponent } from './components/transaction-list/transaction-list.component';

@NgModule({
  declarations: [CardComponent, TransactionListComponent],
  imports: [CommonModule, IonicModule],
  exports: [CardComponent, TransactionListComponent],
})
export class SharedModule {}
