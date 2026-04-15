import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { autoLoginGuard } from './core/guards/auto-login.guard';

const routes: Routes = [
  {
    path: 'login',
    canActivate: [autoLoginGuard],
    loadChildren: () => import('./pages/login/login.module').then((m) => m.LoginPageModule),
  },
  {
    path: 'register',
    canActivate: [autoLoginGuard],
    loadChildren: () =>
      import('./pages/register/register.module').then((m) => m.RegisterPageModule),
  },
  {
    path: 'home',
    canActivate: [authGuard],
    loadChildren: () => import('./home/home.module').then((m) => m.HomePageModule),
  },
  {
    path: 'add-card',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./pages/add-card/add-card.module').then((m) => m.AddCardPageModule),
  },
  {
    path: 'payment',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./pages/payment/payment.module').then((m) => m.PaymentPageModule),
  },
  {
    path: 'history',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./pages/history/history.module').then((m) => m.HistoryPageModule),
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
