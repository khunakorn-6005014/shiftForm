import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  shifts: any[] = [];
  bestMonth: string = 'Loading best month…';
  slugFilter: string = '';
  fromDate: string = '';
  toDate: string = '';


  ngOnInit() {
    const loggedIn = localStorage.getItem('loggedInUser');
    if (!loggedIn) {
      this.router.navigate(['/login']);
    }
    this.applyFilters();
  }

  constructor(private router: Router) {}

  // openNav() {
  //   const sidebar = document.getElementById("mySidebar")!;
  //   const main = document.getElementById("main")!;
  //   sidebar.style.width = "250px";
  //   main.style.marginLeft = "250px";
  // }

  // closeNav() {
  //   const sidebar = document.getElementById("mySidebar")!;
  //   const main = document.getElementById("main")!;
  //   sidebar.style.width = "0";
  //   main.style.marginLeft = "0";
  // }

  logout() {
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('loginTimestamp');
    this.router.navigate(['/login']);
  }

  loadShifts(): any[] {
    const json = localStorage.getItem('shifts');
    return json ? JSON.parse(json) : [];
  }

  calcProfit(start: string, end: string, wage: number): number {
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    let diff = (h2 + m2 / 60) - (h1 + m1 / 60);
    if (diff < 0) diff += 24;
    return diff * wage;
  }
  editShift(slug: string): void {
    this.router.navigate(['/shiftForm'], { queryParams: { slug } });
  }
  
  deleteShift(slug: string): void {
    if (!confirm('Delete this shift?')) return;
    this.shifts = this.shifts.filter(s => s.slug !== slug);
    localStorage.setItem('shifts', JSON.stringify(this.shifts));
    this.applyFilters();
  }
  

  applyFilters(): void {
    let shifts = this.loadShifts();
  
    if (this.slugFilter.trim()) {
      const slug = this.slugFilter.trim().toLowerCase();
      shifts = shifts.filter(s => s.slug.toLowerCase().includes(slug));
    }
  
    if (this.fromDate) {
      shifts = shifts.filter(s => s.date >= this.fromDate);
    }
  
    if (this.toDate) {
      shifts = shifts.filter(s => s.date <= this.toDate);
    }
  
    shifts.sort((a, b) => a.date.localeCompare(b.date));
  
    this.shifts = shifts;
    this.calculateBestMonth();
  }

  clearFilters(): void {
    this.slugFilter = '';
    this.fromDate = '';
    this.toDate = '';
    this.applyFilters();
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