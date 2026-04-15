import { Component, inject } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { CardService } from '../../core/services/card.service';
import { PaymentService } from '../../core/services/payment.service';
import { ToastService } from '../../core/services/toast.service';
import { Card } from '../../core/models/card.model';
import { Transaction } from '../../core/models/transaction.model';

const QUICK_EMOJIS = ['🍔', '🛒', '✈️', '🎬', '☕', '💸', '🎁', '⛽', '🏠', '❤️'];

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  standalone: false,
})
export class HistoryPage {
  private cardService = inject(CardService);
  private paymentService = inject(PaymentService);
  private toast = inject(ToastService);

  quickEmojis = QUICK_EMOJIS;

  private cardFilter$ = new BehaviorSubject<string>('');
  private dateFilter$ = new BehaviorSubject<string>('');

  selectedEmojiTx: Transaction | null = null;

  cards$: Observable<Card[]> = this.cardService.cards$();
  private allTx$ = this.paymentService.transactions$();

  filtered$: Observable<Transaction[]> = combineLatest([
    this.allTx$,
    this.cardFilter$,
    this.dateFilter$,
  ]).pipe(
    map(([txs, cardId, dateIso]) => {
      let out = txs;
      if (cardId) out = out.filter((t) => t.cardId === cardId);
      if (dateIso) {
        const d = new Date(dateIso);
        const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        const end = start + 86_400_000;
        out = out.filter((t) => t.date >= start && t.date < end);
      }
      return out;
    })
  );

  totalSpent$: Observable<number> = this.filtered$.pipe(
    map((txs) => txs.reduce((acc, t) => acc + t.amount, 0))
  );

  onCardChange(ev: CustomEvent): void {
    this.cardFilter$.next((ev.detail.value as string) ?? '');
  }

  onDateChange(ev: CustomEvent): void {
    this.dateFilter$.next((ev.detail.value as string) ?? '');
  }

  clearFilters(): void {
    this.cardFilter$.next('');
    this.dateFilter$.next('');
  }

  openEmojiPicker(tx: Transaction): void {
    this.selectedEmojiTx = tx;
  }

  closeEmojiPicker(): void {
    this.selectedEmojiTx = null;
  }

  async pickEmoji(emoji: string): Promise<void> {
    if (!this.selectedEmojiTx?.id) return;
    try {
      await this.paymentService.setEmoji(this.selectedEmojiTx.id, emoji);
      await this.toast.success('Reacción guardada');
    } catch (e: unknown) {
      await this.toast.error('No se pudo guardar la reacción');
    } finally {
      this.closeEmojiPicker();
    }
  }
}
