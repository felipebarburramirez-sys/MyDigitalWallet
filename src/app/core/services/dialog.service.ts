import { Injectable, inject } from '@angular/core';
import { AlertController } from '@ionic/angular';

export interface ConfirmOptions {
  header?: string;
  message: string;
  okText?: string;
  cancelText?: string;
  danger?: boolean;
}

@Injectable({ providedIn: 'root' })
export class DialogService {
  private alertCtrl = inject(AlertController);

  async confirm(opts: ConfirmOptions): Promise<boolean> {
    return new Promise(async (resolve) => {
      const alert = await this.alertCtrl.create({
        header: opts.header ?? 'Confirmar',
        message: opts.message,
        cssClass: opts.danger ? 'mdw-alert-danger' : 'mdw-alert',
        buttons: [
          {
            text: opts.cancelText ?? 'Cancelar',
            role: 'cancel',
            handler: () => resolve(false),
          },
          {
            text: opts.okText ?? 'Aceptar',
            role: 'confirm',
            handler: () => resolve(true),
          },
        ],
      });
      await alert.present();
    });
  }

  async alert(message: string, header = 'Aviso'): Promise<void> {
    const a = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK'],
    });
    await a.present();
    await a.onDidDismiss();
  }
}
