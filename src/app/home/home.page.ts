import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AuthService } from '../core/services/auth.service';
import { CardService } from '../core/services/card.service';
import { BiometricService } from '../core/services/biometric.service';
import { FirestoreService } from '../core/services/firestore.service';
import { ToastService } from '../core/services/toast.service';
import { Card } from '../core/models/card.model';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  private auth = inject(AuthService);
  private cardService = inject(CardService);
  private router = inject(Router);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private biometric = inject(BiometricService);
  private firestoreSvc = inject(FirestoreService);
  private toastSvc = inject(ToastService);

  showBalance = true;
  biometricAvailable = false;
  biometricEnabled = false;
  cards$: Observable<Card[]> = this.cardService.cards$();
  totalBalance$: Observable<number> = this.cards$.pipe(
    map((cards) => cards.reduce((acc, c) => acc + (c.balance || 0), 0))
  );
  displayName$: Observable<string> = this.auth.user$.pipe(
    map((u) => u?.displayName || u?.email?.split('@')[0] || 'Usuario')
  );

  async ngOnInit(): Promise<void> {
    this.biometricAvailable = await this.biometric.isAvailable();
    const user = this.auth.currentUser;
    if (user) {
      const profile = await this.auth.getProfile(user.uid);
      this.biometricEnabled = !!profile?.biometricEnabled;
    }
  }

  toggleBalance(): void {
    this.showBalance = !this.showBalance;
  }

  async toggleBiometric(): Promise<void> {
    const user = this.auth.currentUser;
    if (!user?.email) return;

    if (this.biometricEnabled) {
      await this.biometric.deleteCredentials();
      await this.firestoreSvc.updateDocument(`users/${user.uid}`, { biometricEnabled: false });
      this.biometricEnabled = false;
      await this.toastSvc.success('Biometría desactivada');
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Activar biometría',
      message: 'Confirma tu contraseña para vincular tu huella o FaceID.',
      inputs: [{ name: 'password', type: 'password', placeholder: 'Contraseña' }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Activar',
          handler: async (data) => {
            const password = (data?.password ?? '').trim();
            if (!password) return false;
            try {
              await this.auth.login(user.email!, password);
              const ok = await this.biometric.verify('Vincula tu biometría');
              if (!ok) {
                await this.toastSvc.error('Verificación biométrica cancelada');
                return false;
              }
              await this.biometric.saveCredentials({ username: user.email!, password });
              await this.firestoreSvc.updateDocument(`users/${user.uid}`, {
                biometricEnabled: true,
              });
              this.biometricEnabled = true;
              await this.toastSvc.success('Biometría activada');
              return true;
            } catch {
              await this.toastSvc.error('Contraseña incorrecta');
              return false;
            }
          },
        },
      ],
    });
    await alert.present();
  }

  goAddCard(): void {
    this.router.navigateByUrl('/add-card');
  }

  goPay(): void {
    this.router.navigateByUrl('/payment');
  }

  goHistory(): void {
    this.router.navigateByUrl('/history');
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
