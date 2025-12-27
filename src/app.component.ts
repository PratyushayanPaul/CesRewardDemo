import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { DataService } from './services/data.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, NgClass],
  templateUrl: './app.component.html'
})
export class AppComponent {
  dataService = inject(DataService);
  router = inject(Router);

  user = this.dataService.currentUser;

  logout() {
    this.dataService.logout();
    this.router.navigate(['/login']);
  }
}