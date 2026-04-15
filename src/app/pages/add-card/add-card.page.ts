import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { CardService } from '../../core/services/card.service';
import { Card, CardBrand } from '../../core/models/card.model';

@Component({
  selector: 'app-add-card',
  templateUrl: './add-card.page.html',
  styleUrls: ['./add-card.page.scss'],
  standalone: false,
})
export class AddCardPage {
  private fb = inject(FormBuilder);
  private cardService = inject(CardService);
  private router = inject(Router);
  private toastCtrl = inject(ToastController);

  loading = false;
  brand: CardBrand = 'unknown';

  form = this.fb.nonNullable.group({
    holder: ['', [Validators.required, Validators.minLength(3)]],
    number: ['', [Validators.required]],
    expiration: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
  });

  get previewCard(): Card {
    const digits = this.form.controls.number.value.replace(/\D/g, '');
    const exp = this.form.controls.expiration.value;
    const [mm, yy] = exp.includes('/') ? exp.split('/') : ['', ''];
    return {
      holder: this.form.controls.holder.value || 'NOMBRE APELLIDO',
      number: digits,
      last4: digits.slice(-4).padStart(4, '•'),
      brand: this.brand,
      expMonth: parseInt(mm, 10) || 0,
      expYear: parseInt(yy, 10) || 0,
      balance: 0,
      createdAt: 0,
    };
  }

  onNumberInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const formatted = CardService.formatNumber(target.value);
    this.form.controls.number.setValue(formatted, { emitEvent: false });
    target.value = formatted;
    this.brand = CardService.detectBrand(formatted);
  }

  onExpirationInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    let v = target.value.replace(/\D/g, '').slice(0, 4);
    if (v.length >= 3) v = `${v.slice(0, 2)}/${v.slice(2)}`;
    this.form.controls.expiration.setValue(v, { emitEvent: false });
    target.value = v;
  }

  async submit(): Promise<void> {
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }
    const { holder, number, expiration } = this.form.getRawValue();
    const [mm, yy] = expiration.split('/');
    this.loading = true;
    try {
      await this.cardService.addCard({
        holder,
        number,
        expMonth: parseInt(mm, 10),
        expYear: 2000 + parseInt(yy, 10),
      });
      await this.toast('Tarjeta agregada', 'success');
      await this.router.navigateByUrl('/home', { replaceUrl: true });
    } catch (e: unknown) {
      console.error('[AddCard] error', e);
      const msg = (e as { message?: string })?.message ?? 'No se pudo agregar la tarjeta';
      await this.toast(msg, 'danger');
    } finally {
      this.loading = false;
    }
  }

  private async toast(message: string, color: 'success' | 'danger'): Promise<void> {
    const t = await this.toastCtrl.create({ message, duration: 2500, color });
    await t.present();
  }
}
