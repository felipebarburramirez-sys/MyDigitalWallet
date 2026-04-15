import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Transaction } from '../../../core/models/transaction.model';

@Component({
  selector: 'app-transaction-list',
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.scss'],
  standalone: false,
})
export class TransactionListComponent {
  @Input() transactions: Transaction[] = [];
  @Output() longPress = new EventEmitter<Transaction>();

  private pressTimer: ReturnType<typeof setTimeout> | null = null;

  onPressStart(tx: Transaction): void {
    this.pressTimer = setTimeout(() => this.longPress.emit(tx), 2000);
  }

  onPressEnd(): void {
    if (this.pressTimer) {
      clearTimeout(this.pressTimer);
      this.pressTimer = null;
    }
  }

  trackById(_: number, tx: Transaction): string {
    return tx.id ?? `${tx.date}-${tx.merchant}`;
  }
}
