import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-balance-display',
  templateUrl: './balance-display.component.html',
  styleUrls: ['./balance-display.component.scss'],
  standalone: false,
})
export class BalanceDisplayComponent {
  @Input() greeting = 'Hola,';
  @Input() displayName: string | null = '';
  @Input() balance: number | null = 0;
  @Input() show = true;
  @Output() toggle = new EventEmitter<void>();
}
