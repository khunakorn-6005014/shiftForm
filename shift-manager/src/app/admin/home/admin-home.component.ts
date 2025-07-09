import { Component, OnInit }            from '@angular/core';
import { CommonModule }                  from '@angular/common';
import { RouterModule, Router }          from '@angular/router';

interface Shift {
  user: string;
  date: string;
  startTime: string;
  endTime: string;
  hourlyWage: number;
  place: string;
  slug: string;
}

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.scss']
})
export class AdminHomeComponent implements OnInit {
  currentAdminName = '';
  shifts: Shift[] = [];

  topWorkerName  = '—';
  topWorkerCount = 0;

  weeklyShifts: Shift[] = [];
  bestMonthText  = 'Loading best month…';

  constructor(private router: Router) {}

  ngOnInit() {
    // 1) verify admin
    const rawAdmins = localStorage.getItem('adminUsers') || '[]';
    const adminUsers: string[] = JSON.parse(rawAdmins);  
    const rawLogged = localStorage.getItem('loggedInUser') || '';
    const loggedObj = rawLogged ? JSON.parse(rawLogged) : null;
    const username = loggedObj?.username;

    if (!username || !adminUsers.includes(username)) {
      // not an admin → kick back to login
      this.router.navigate(['/login']);
      return;
    }
    this.currentAdminName = username;

    // 2) load and compute stats
    this.shifts = this.loadShifts();
    this.computeWorkerOfMonth();
    this.computeWeeklyShifts();
    this.computeBestMonth();
  }

  goToShifts()   { this.router.navigate(['/admin/shifts']); }
  goToWorkers()  { this.router.navigate(['/admin/workers']); }
  logout()       { 
    localStorage.removeItem('loggedInUser');
    this.router.navigate(['/login']); 
  }

  private loadShifts(): Shift[] {
    const raw = localStorage.getItem('shifts');
    return raw ? JSON.parse(raw) : [];
  }

  calcProfit(s: Shift): number {
    const [h1, m1] = s.startTime.split(':').map(Number);
    const [h2, m2] = s.endTime.split(':').map(Number);
    let diff = (h2 + m2/60) - (h1 + m1/60);
    if (diff < 0) diff += 24;
    return diff * s.hourlyWage;
  }

  private computeWorkerOfMonth() {
    const now = new Date();
    const prev = new Date(now.getFullYear(), now.getMonth()-1);
    const key = `${prev.getFullYear()}-${String(prev.getMonth()+1).padStart(2,'0')}`;

    const counts: Record<string,number> = {};
    this.shifts
      .filter(s => s.date.startsWith(key))
      .forEach(s => counts[s.user] = (counts[s.user]||0) + 1);

    let top = { user:'', count: 0 };
    for (const [u,c] of Object.entries(counts)) {
      if (c > top.count) top = { user: u, count: c };
    }

    if (top.user) {
      this.topWorkerName  = top.user;
      this.topWorkerCount = top.count;
    }
  }

  private computeWeeklyShifts() {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);

    this.weeklyShifts = this.shifts
      .filter(s => {
        const d = new Date(s.date);
        return d >= weekAgo && d <= today;
      })
      .sort((a,b) => b.date.localeCompare(a.date));
  }

  private computeBestMonth() {
    const earnings: Record<string, number> = {};
    this.shifts.forEach(s => {
      const key = s.date.slice(0,7);
      earnings[key] = (earnings[key]||0) + this.calcProfit(s);
    });

    let best = { month:'', total:0 };
    for (const [m,t] of Object.entries(earnings)) {
      if (t > best.total) best = { month: m, total: t };
    }

    if (best.month) {
      const [y,mm] = best.month.split('-').map(Number);
      const name = new Date(y,mm-1)
        .toLocaleString('default',{month:'long',year:'numeric'});
      this.bestMonthText = `Highest earnings: ${name} ($${best.total.toFixed(2)})`;
    } else {
      this.bestMonthText = 'No shifts to calculate best month.';
    }
  }
}