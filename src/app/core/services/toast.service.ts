import { Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular';

export type ToastKind = 'success' | 'danger' | 'warning' | 'primary';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastCtrl = inject(ToastController);

  async show(message: string, kind: ToastKind = 'primary', duration = 2200): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration,
      color: kind,
      position: 'top',
      buttons: [{ text: '✕', role: 'cancel' }],
    });
    await toast.present();
  }

  success(message: string) {
    return this.show(message, 'success');
  }
  error(message: string) {
    return this.show(message, 'danger', 3000);
  }
  warn(message: string) {
    return this.show(message, 'warning');
  }
}
