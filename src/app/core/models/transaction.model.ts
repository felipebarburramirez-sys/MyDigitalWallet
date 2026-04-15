export interface Transaction {
  id?: string;
  cardId: string;
  cardLast4: string;
  merchant: string;
  amount: number;
  date: number;
  emoji?: string;
}
