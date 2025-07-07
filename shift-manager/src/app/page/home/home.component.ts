import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule }      from '@angular/common';    // ngIf, ngFor, currency pipe
import { FormsModule }       from '@angular/forms';     // ngModel
import { RouterModule }      from '@angular/router';    // routerLink, routerLinkActive



interface Shift {
  slug: string;
  date: string;
  startTime: string;
  endTime: string;
  hourlyWage: number;
  place: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  shifts: Shift[] = [];
  filteredShifts: Shift[] = [];
  filters = { slug: '', from: '', to: '' };
  bestMonthText = '';
  welcomeMsg = '';
  sidebarOpen = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.showGreeting();
    this.loadShifts();
    this.applyFilters();
  }

  // Sidebar toggle

  openNav()  { this.sidebarOpen = true; }
  closeNav() { this.sidebarOpen = false; }
  // …

  // Greeting
  showGreeting() {
    const userJson = localStorage.getItem("loggedInUser");
    if (!userJson) return;
    const user = JSON.parse(userJson);
    const name = user.username || user.firstName || 'User';
    this.welcomeMsg = `Hello – ${name}, welcome to your Dashboard!`;
  }

  logout() {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("jwt");
    this.router.navigate(['/login']);
  }

  // Load/save shifts
  loadShifts() {
    const json = localStorage.getItem('shifts');
    this.shifts = json ? JSON.parse(json) : [];
  }

  saveShifts(shiftsArray: Shift[]) {
    localStorage.setItem('shifts', JSON.stringify(shiftsArray));
    this.shifts = shiftsArray;
  }

  // Profit calculation
  calcProfit(start: string, end: string, wage: number): number {
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    let diff = (h2 + m2 / 60) - (h1 + m1 / 60);
    if (diff < 0) diff += 24;
    return diff * wage;
  }

  // Filtering
  applyFilters() {
    let shifts = [...this.shifts];
    const slugVal = this.filters.slug.trim().toLowerCase();
    if (slugVal) {
      shifts = shifts.filter(s => s.slug.toLowerCase().includes(slugVal));
    }
    if (this.filters.from) {
      shifts = shifts.filter(s => s.date >= this.filters.from);
    }
    if (this.filters.to) {
      shifts = shifts.filter(s => s.date <= this.filters.to);
    }
    this.filteredShifts = shifts;
    this.showBestMonth(shifts);
  }

  clearFilters() {
    this.filters = { slug: '', from: '', to: '' };
    this.applyFilters();
  }

  showBestMonth(shifts: Shift[]) {
    const earnings: Record<string, number> = {};
    shifts.forEach(s => {
      const key = s.date.slice(0, 7); // 'YYYY-MM'
      earnings[key] = (earnings[key] || 0) + this.calcProfit(s.startTime, s.endTime, s.hourlyWage);
    });
    let best = { month: '', total: 0 };
    for (const [m, total] of Object.entries(earnings)) {
      if (total > best.total) best = { month: m, total };
    }
    if (!best.month) {
      this.bestMonthText = 'No shifts to calculate best month.';
    } else {
      const [y, mm] = best.month.split('-');
      const name = new Date(+y, +mm - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
      this.bestMonthText = `Highest earnings: ${name} ($${best.total.toFixed(2)})`;
    }
  }

  onRowClick(shift: Shift) {
    this.router.navigate(['/add_edit_shift'], { queryParams: { slug: shift.slug } });
  }

  onEdit(shift: Shift, event: MouseEvent) {
    event.stopPropagation();
    this.onRowClick(shift);
  }

  onDelete(shift: Shift, event: MouseEvent) {
    event.stopPropagation();
    if (!confirm('Delete this shift?')) return;
    const updated = this.shifts.filter(s => s.slug !== shift.slug);
    this.saveShifts(updated);
    this.applyFilters();
  }
}
