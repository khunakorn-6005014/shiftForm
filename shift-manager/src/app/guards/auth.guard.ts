// src/app/guards/auth.guard.ts

import { Injectable }           from '@angular/core';
import {CanActivate,Router,UrlTree,ActivatedRouteSnapshot,RouterStateSnapshot} from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    const token = localStorage.getItem('jwt');
    if (token) {
      // Optionally: validate token expiry here
      return true;
    }
    // No token → redirect to login page
    return this.router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url }
    });
  }
}
