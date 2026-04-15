import { Component, Input } from '@angular/core';
import { Card } from '../../../core/models/card.model';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  standalone: false,
})
export class CardComponent {
  @Input({ required: true }) card!: Card;
  @Input() showBalance = true;

  get expString(): string {
    const mm = String(this.card.expMonth).padStart(2, '0');
    const yy = String(this.card.expYear).padStart(2, '0').slice(-2);
    return `${mm}/${yy}`;
  }

  get brandLabel(): string {
    return this.card.brand === 'visa'
      ? 'VISA'
      : this.card.brand === 'mastercard'
      ? 'Mastercard'
      : '';
  }
}
