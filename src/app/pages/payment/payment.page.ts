import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, firstValueFrom } from 'rxjs';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { CardService } from '../../core/services/card.service';
import { PaymentService } from '../../core/services/payment.service';
import { ToastService } from '../../core/services/toast.service';
import { LoadingService } from '../../core/services/loading.service';
import { DialogService } from '../../core/services/dialog.service';
import { Card } from '../../core/models/card.model';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.page.html',
  styleUrls: ['./payment.page.scss'],
  standalone: false,
})
export class PaymentPage implements OnInit {
  private fb = inject(FormBuilder);
  private cardService = inject(CardService);
  private paymentService = inject(PaymentService);
  private toast = inject(ToastService);
  private loading = inject(LoadingService);
  private dialog = inject(DialogService);
  private router = inject(Router);

  cards$: Observable<Card[]> = this.cardService.cards$();
  selectedCard: Card | null = null;

  form = this.fb.nonNullable.group({
    cardId: ['', Validators.required],
    merchant: ['', [Validators.required, Validators.minLength(2)]],
    amount: [0, [Validators.required, Validators.min(1000)]],
  });

  ngOnInit(): void {
    this.form.controls.cardId.valueChanges.subscribe((id) => {
      this.cards$
        .subscribe((cards) => {
          this.selectedCard = cards.find((c) => c.id === id) ?? null;
        })
        .unsubscribe();
    });
  }

  randomize(): void {
    const { merchant, amount } = PaymentService.randomMerchant();
    this.form.patchValue({ merchant, amount });
    Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const cards = await firstValueFrom(this.cards$);
    const card = cards.find((c) => c.id === this.form.controls.cardId.value);
    if (!card) {
      await this.toast.error('Selecciona una tarjeta válida');
      return;
    }
    const { merchant, amount } = this.form.getRawValue();

    const ok = await this.dialog.confirm({
      header: 'Confirmar pago',
      message: `¿Pagar $${amount.toLocaleString('es-CO')} a ${merchant} con la tarjeta •••• ${card.last4}?`,
      okText: 'Pagar',
    });
    if (!ok) return;

    try {
      await this.loading.wrap(
        () => this.paymentService.pay(card, merchant, amount),
        'Procesando pago...'
      );
      Haptics.notification({ type: NotificationType.Success }).catch(() => {});
      await this.toast.success(`Pago exitoso a ${merchant}`);
      await this.router.navigateByUrl('/home', { replaceUrl: true });
    } catch (e: unknown) {
      Haptics.notification({ type: NotificationType.Error }).catch(() => {});
      const msg = (e as { message?: string })?.message ?? 'No se pudo procesar el pago';
      await this.toast.error(msg);
    }
  }
}
