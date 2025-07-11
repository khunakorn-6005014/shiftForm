import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  loggedInUser = localStorage.getItem('loggedInUser');
  upcomingShift: any = null;
  pastShifts: any[] = [];
  bestMonth: string = 'Loading best month…';
  shifts: any[] = this.loadShifts();

  constructor(private router: Router) {}

  ngOnInit(): void {
    const shifts = JSON.parse(localStorage.getItem('shifts') || '[]')
      .filter((s: any) => s.user === this.loggedInUser);

    const today = new Date().toISOString().split('T')[0];
    const dayOfWeek = new Date().getDay(); // 0 (Sun) ~ 6 (Sat)
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
    const endOfToday = new Date();

    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    this.upcomingShift = shifts
      .filter((s: any) => s.date > today)
      .sort((a: any, b: any) => a.date.localeCompare(b.date))[0] || null;

    this.pastShifts = shifts.filter((s: any) => {
      return s.date < today &&
        s.date >= formatDate(startOfWeek) &&
        s.date <= formatDate(endOfToday);
    }).sort((a: any, b: any) => b.date.localeCompare(a.date));

    this.calculateBestMonth();
  }

  logout() {
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('loginTimestamp');
    this.router.navigate(['/login']);
  }

  loadShifts(): any[] {
    const json = localStorage.getItem('shifts');
    const allShifts = json ? JSON.parse(json) : [];
  
    const loggedInUser = localStorage.getItem('loggedInUser');
    return allShifts.filter((shift: any) => shift.user === loggedInUser);
  }

  calcProfit(start: string, end: string, wage: number): number {
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    let diff = (h2 + m2 / 60) - (h1 + m1 / 60);
    if (diff < 0) diff += 24;
    return diff * wage;
  }

  calculateBestMonth(): void {
    const earnings: Record<string, number> = {};
    this.shifts.forEach(s => {
      const key = s.date.slice(0, 7); // YYYY-MM
      earnings[key] = (earnings[key] || 0) + this.calcProfit(s.startTime, s.endTime, s.hourlyWage);
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