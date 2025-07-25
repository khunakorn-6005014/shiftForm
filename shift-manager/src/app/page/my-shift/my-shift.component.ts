import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-my-shift',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './my-shift.component.html',
  styleUrl: './my-shift.component.scss'
})
export class MyShiftComponent implements OnInit {
  allShifts: any[] = [];
  shifts: any[] = [];
  bestMonth: string = 'Loading best month…';
  slugFilter: string = '';
  fromDate: string = '';
  toDate: string = '';
  loggedInUser: string | null = localStorage.getItem('loggedInUser');
  placeFilter: string = '';

  constructor(private router: Router) {}

  ngOnInit() {
    const loggedIn = localStorage.getItem('loggedInUser');
    if (!loggedIn) {
      this.router.navigate(['/login']);
    }
    this.applyFilters();
  }

  logout() {
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('loginTimestamp');
    this.router.navigate(['/login']);
  }

  loadShifts(): any[] {
    const json = localStorage.getItem('shifts');
    return json ? JSON.parse(json) : [];
  }

  calcProfit(startDate: string, startTime: string, endDate: string, endTime: string, wage: number): number {
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);
    const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return Math.max(0, diffHours) * wage;
  }

  editShift(slug: string): void {
    this.router.navigate(['/shiftForm'], { queryParams: { slug } });
  }

  deleteShift(slug: string): void {
    if (!confirm('Delete this shift?')) return;
    const shifts = this.allShifts.filter(s => s.slug !== slug);
    localStorage.setItem('shifts', JSON.stringify(shifts));
    this.applyFilters();
  }

  applyFilters(): void {
    if (!this.loggedInUser) {
      this.shifts = [];
      return;
    }

    this.allShifts = this.loadShifts();

    let shifts = this.allShifts.filter(s => s.user === this.loggedInUser);

    if (this.placeFilter) {
      shifts = shifts.filter(s => s.place === this.placeFilter);
    }

    if (this.slugFilter.trim()) {
      const slug = this.slugFilter.trim().toLowerCase();
      shifts = shifts.filter(s => s.slug.toLowerCase().includes(slug));
    }

    if (this.fromDate) {
      shifts = shifts.filter(s => s.startDate >= this.fromDate);
    }

    if (this.toDate) {
      shifts = shifts.filter(s => s.endDate <= this.toDate);
    }

    shifts.sort((a, b) => a.startDate.localeCompare(b.startDate));

    this.shifts = shifts;
    this.calculateBestMonth();
  }

  clearFilters(): void {
    this.placeFilter = '';
    this.slugFilter = '';
    this.fromDate = '';
    this.toDate = '';
    this.applyFilters();
  }

  calculateBestMonth(): void {
    const earnings: Record<string, number> = {};
    this.shifts.forEach(s => {
      const key = s.startDate.slice(0, 7); // YYYY-MM
      const profit = this.calcProfit(s.startDate, s.startTime, s.endDate, s.endTime, s.hourlyWage);
      earnings[key] = (earnings[key] || 0) + profit;
    });

    let best: { month: string | null; total: number } = { month: null, total: 0 };
    for (const [m, total] of Object.entries(earnings)) {
      if (total > best.total) best = { month: m, total };
    }

    if (!best.month) {
      this.bestMonth = 'No shifts to calculate best month.';
    } else {
      const [y, mm] = best.month.split('-');
      const name = new Date(+y, +mm - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
      this.bestMonth = `Highest earnings: ${name} ($${best.total.toFixed(2)})`;
    }
  }
}
