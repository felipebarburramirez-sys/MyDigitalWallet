export type CardBrand = 'visa' | 'mastercard' | 'unknown';

export interface Card {
  id?: string;
  holder: string;
  number: string;
  last4: string;
  brand: CardBrand;
  expMonth: number;
  expYear: number;
  balance: number;
  createdAt: number;
}
