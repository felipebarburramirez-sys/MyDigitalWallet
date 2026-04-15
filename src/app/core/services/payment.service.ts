import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  doc,
  orderBy,
  query,
  runTransaction,
  where,
} from '@angular/fire/firestore';
import { Observable, of, switchMap } from 'rxjs';
import { AuthService } from './auth.service';
import { Card } from '../models/card.model';
import { Transaction } from '../models/transaction.model';

const MERCHANTS = [
  'Amazon',
  'Netflix',
  'Spotify',
  'Uber',
  'Rappi',
  'Starbucks',
  'McDonald\'s',
  'Apple Store',
  'Steam',
  'Mercado Libre',
  'Éxito',
  'Carulla',
];

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private firestore = inject(Firestore);
  private auth = inject(AuthService);

  /** Generates a fake merchant + amount (stand-in for faker.js). */
  static randomMerchant(): { merchant: string; amount: number } {
    const merchant = MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)];
    const amount = Math.floor(Math.random() * 490_000) + 10_000;
    return { merchant, amount };
  }

  transactions$(cardId?: string): Observable<Transaction[]> {
    return this.auth.user$.pipe(
      switchMap((u) => {
        if (!u) return of([] as Transaction[]);
        const ref = collection(this.firestore, `users/${u.uid}/transactions`);
        const q = cardId
          ? query(ref, where('cardId', '==', cardId), orderBy('date', 'desc'))
          : query(ref, orderBy('date', 'desc'));
        return collectionData(q, { idField: 'id' }) as Observable<Transaction[]>;
      })
    );
  }

  /** Charges the card (atomic balance decrement) and logs the transaction. */
  async pay(card: Card, merchant: string, amount: number): Promise<string> {
    const user = this.auth.currentUser;
    if (!user || !card.id) throw new Error('No authenticated user / invalid card');
    if (amount <= 0) throw new Error('Monto inválido');

    const cardRef = doc(this.firestore, `users/${user.uid}/cards/${card.id}`);
    await runTransaction(this.firestore, async (tx) => {
      const snap = await tx.get(cardRef);
      if (!snap.exists()) throw new Error('Tarjeta no encontrada');
      const current = snap.data()['balance'] as number;
      if (current < amount) throw new Error('Saldo insuficiente');
      tx.update(cardRef, { balance: current - amount });
    });

    const txData: Omit<Transaction, 'id'> = {
      cardId: card.id,
      cardLast4: card.last4,
      merchant,
      amount,
      date: Date.now(),
    };
    const ref = await addDoc(
      collection(this.firestore, `users/${user.uid}/transactions`),
      txData
    );
    return ref.id;
  }

  async setEmoji(txId: string, emoji: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('No authenticated user');
    const { updateDoc } = await import('@angular/fire/firestore');
    await updateDoc(doc(this.firestore, `users/${user.uid}/transactions/${txId}`), { emoji });
  }
}
