import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton-loading',
  templateUrl: './skeleton-loading.component.html',
  styleUrls: ['./skeleton-loading.component.scss'],
  standalone: false,
})
export class SkeletonLoadingComponent {
  @Input() variant: 'card' | 'line' | 'list' = 'card';
  @Input() count = 3;

  get items(): number[] {
    return Array.from({ length: this.count }, (_, i) => i);
  }
}
