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
    const allShifts = this.loadShifts();

    const now = new Date();
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday
    const endOfToday = new Date();

    // Parse string + time into real Date object
    const toDateTime = (dateStr: string, timeStr: string): Date => {
      return new Date(`${dateStr}T${timeStr}`);
    };

    // Find upcoming shift
    this.upcomingShift = allShifts
      .filter((s: any) => toDateTime(s.startDate, s.startTime) > now)
      .sort((a: any, b: any) => {
        return toDateTime(a.startDate, a.startTime).getTime() - toDateTime(b.startDate, b.startTime).getTime();
      })[0] || null;

    // Find past shifts in this week
    this.pastShifts = allShifts
      .filter((s: any) => {
        const endDateTime = toDateTime(s.endDate || s.startDate, s.endTime);
        return endDateTime < now &&
          endDateTime >= startOfWeek &&
          endDateTime <= endOfToday;
      })
      .sort((a: any, b: any) => {
        return toDateTime(b.startDate, b.startTime).getTime() - toDateTime(a.startDate, a.startTime).getTime();
      });

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
    return allShifts.filter((shift: any) => shift.user === this.loggedInUser);
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
      const key = (s.startDate || '').slice(0, 7); // YYYY-MM
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
