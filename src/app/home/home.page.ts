import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AuthService } from '../core/services/auth.service';
import { CardService } from '../core/services/card.service';
import { Card } from '../core/models/card.model';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  private auth = inject(AuthService);
  private cardService = inject(CardService);
  private router = inject(Router);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);

  showBalance = true;
  cards$: Observable<Card[]> = this.cardService.cards$();
  totalBalance$: Observable<number> = this.cards$.pipe(
    map((cards) => cards.reduce((acc, c) => acc + (c.balance || 0), 0))
  );
  displayName$: Observable<string> = this.auth.user$.pipe(
    map((u) => u?.displayName || u?.email?.split('@')[0] || 'Usuario')
  );

  toggleBalance(): void {
    this.showBalance = !this.showBalance;
  }

  goAddCard(): void {
    this.router.navigateByUrl('/add-card');
  }

  goPay(): void {
    this.router.navigateByUrl('/payment');
  }

  goHistory(): void {
    this.toast('Próximamente: historial', 'medium');
  }

  async confirmDelete(card: Card): Promise<void> {
    if (!card.id) return;
    const alert = await this.alertCtrl.create({
      header: 'Eliminar tarjeta',
      message: `¿Eliminar la tarjeta •••• ${card.last4}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.cardService.deleteCard(card.id!);
            await this.toast('Tarjeta eliminada', 'success');
          },
        },
      ],
    });
    await alert.present();
  }

  async logout(): Promise<void> {
    await this.auth.logout();
    await this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  trackById(_: number, c: Card): string {
    return c.id ?? c.last4;
  }

  private async toast(message: string, color: 'success' | 'medium'): Promise<void> {
    const t = await this.toastCtrl.create({ message, duration: 1800, color });
    await t.present();
  }
}
