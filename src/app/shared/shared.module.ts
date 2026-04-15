import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { CardComponent } from './components/card/card.component';
import { TransactionListComponent } from './components/transaction-list/transaction-list.component';
import { BalanceDisplayComponent } from './components/balance-display/balance-display.component';
import { QuickActionsComponent } from './components/quick-actions/quick-actions.component';
import { SkeletonLoadingComponent } from './components/skeleton-loading/skeleton-loading.component';

const COMPONENTS = [
  CardComponent,
  TransactionListComponent,
  BalanceDisplayComponent,
  QuickActionsComponent,
  SkeletonLoadingComponent,
];

@NgModule({
  declarations: COMPONENTS,
  imports: [CommonModule, IonicModule],
  exports: COMPONENTS,
})
export class SharedModule {}
