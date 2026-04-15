import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  orderBy,
  query,
} from '@angular/fire/firestore';
import { Observable, of, switchMap } from 'rxjs';
import { AuthService } from './auth.service';
import { Card, CardBrand } from '../models/card.model';

@Injectable({ providedIn: 'root' })
export class CardService {
  private firestore = inject(Firestore);
  private auth = inject(AuthService);

  /** Luhn algorithm — validates card number integrity. */
  static luhnCheck(raw: string): boolean {
    const digits = raw.replace(/\D/g, '');
    if (digits.length < 12 || digits.length > 19) return false;
    let sum = 0;
    let alt = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let n = parseInt(digits[i], 10);
      if (alt) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      sum += n;
      alt = !alt;
    }
    return sum % 10 === 0 && sum > 0;
  }

  /** BIN-based brand detection (Visa, Mastercard). */
  static detectBrand(raw: string): CardBrand {
    const d = raw.replace(/\D/g, '');
    if (!d) return 'unknown';
    if (d.startsWith('4')) return 'visa';
    const two = parseInt(d.slice(0, 2), 10);
    if (two >= 51 && two <= 55) return 'mastercard';
    const four = parseInt(d.slice(0, 4), 10);
    if (four >= 2221 && four <= 2720) return 'mastercard';
    return 'unknown';
  }

  /** Format as 4-digit blocks (e.g. "4111 1111 1111 1111"). */
  static formatNumber(raw: string): string {
    return raw.replace(/\D/g, '').slice(0, 19).replace(/(.{4})/g, '$1 ').trim();
  }

  cards$(): Observable<Card[]> {
    return this.auth.user$.pipe(
      switchMap((u) => {
        if (!u) return of([] as Card[]);
        const ref = collection(this.firestore, `users/${u.uid}/cards`);
        return collectionData(query(ref, orderBy('createdAt', 'desc')), {
          idField: 'id',
        }) as Observable<Card[]>;
      })
    );
  }

  async addCard(input: {
    holder: string;
    number: string;
    expMonth: number;
    expYear: number;
  }): Promise<string> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('No authenticated user');
    const digits = input.number.replace(/\D/g, '');
    if (!CardService.luhnCheck(digits)) throw new Error('Número de tarjeta inválido (Luhn)');
    const brand = CardService.detectBrand(digits);
    if (brand === 'unknown') throw new Error('Solo se aceptan Visa o Mastercard');

    const card: Omit<Card, 'id'> = {
      holder: input.holder.trim().toUpperCase(),
      number: digits,
      last4: digits.slice(-4),
      brand,
      expMonth: input.expMonth,
      expYear: input.expYear,
      balance: Math.floor(Math.random() * 9_000_000) + 1_000_000,
      createdAt: Date.now(),
    };
    const ref = await addDoc(collection(this.firestore, `users/${user.uid}/cards`), card);
    return ref.id;
  }

  async deleteCard(cardId: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('No authenticated user');
    await deleteDoc(doc(this.firestore, `users/${user.uid}/cards/${cardId}`));
  }
}
