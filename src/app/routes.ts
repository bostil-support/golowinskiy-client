import {Routes} from '@angular/router';
import {MainComponent} from './components/main/main.component';
import {AuthComponent} from './components/auth/auth.component';
import {SignupComponent} from './components/signup/signup.component';
import {SecretsComponent} from './components/secrets/secrets.component';
import {AuthGuardService} from './services/auth-guard.service';
import {ProductComponent} from './components/product/product.component';
import {ImagesComponent} from './components/images/images.component';

export const appRoutes: Routes = [
  {path: '', component: MainComponent},
  {path: 'auth', component: AuthComponent},
  {path: 'signup', component: SignupComponent},
  {path: 'secrets', component: SecretsComponent, canActivate: [AuthGuardService]},
  {path: 'product', component: ProductComponent, canActivate: [AuthGuardService]},
  {path: 'images', component: ImagesComponent, canActivate: [AuthGuardService]},
  { path: '**', redirectTo: '' },
];
