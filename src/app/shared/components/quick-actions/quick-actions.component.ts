import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface QuickAction {
  key: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-quick-actions',
  templateUrl: './quick-actions.component.html',
  styleUrls: ['./quick-actions.component.scss'],
  standalone: false,
})
export class QuickActionsComponent {
  @Input() actions: QuickAction[] = [];
  @Output() actionClick = new EventEmitter<string>();

  trackByKey(_: number, a: QuickAction): string {
    return a.key;
  }
}
