import { Component, OnInit }       from '@angular/core';
import { CommonModule }             from '@angular/common';
import { FormsModule }              from '@angular/forms';
import { Router, RouterModule }     from '@angular/router';

interface Shift {
  user: string;
  date: string;
  startTime: string;
  endTime: string;
  hourlyWage: number;
  place: string;
  slug: string;
  comments?: string;
}

@Component({
  selector: 'app-all-shifts',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './all-shifts.component.html',
  styleUrls: ['./all-shifts.component.scss']
})
export class AllShiftsComponent implements OnInit {
  shifts: Shift[] = [];
  filteredShifts: Shift[] = [];
  filters = { name: '', place: '', from: '', to: '' };

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadShifts();
    this.applyFilters();
  }

  private loadShifts() {
    const json = localStorage.getItem('shifts');
    this.shifts = json ? JSON.parse(json) : [];
    this.filteredShifts = [...this.shifts];
  }

  applyFilters() {
    let arr = [...this.shifts];

    const n = this.filters.name.trim().toLowerCase();
    if (n) {
      arr = arr.filter(s => s.user.toLowerCase().includes(n));
    }

    const p = this.filters.place.trim().toLowerCase();
    if (p) {
      arr = arr.filter(s => s.place.toLowerCase().includes(p));
    }

    if (this.filters.from) {
      arr = arr.filter(s => s.date >= this.filters.from);
    }
    if (this.filters.to) {
      arr = arr.filter(s => s.date <= this.filters.to);
    }

    this.filteredShifts = arr;
  }

  clearFilters() {
    this.filters = { name: '', place: '', from: '', to: '' };
    this.applyFilters();
  }

  calcProfit(s: Shift): number {
    const [h1, m1] = s.startTime.split(':').map(Number);
    const [h2, m2] = s.endTime.split(':').map(Number);
    let diff = (h2 + m2/60) - (h1 + m1/60);
    if (diff < 0) diff += 24;
    return diff * s.hourlyWage;
  }

  onRowClick(s: Shift) {
    // navigate to your Add/Edit Shift page with slug query
    this.router.navigate(['/add_edit_shift'], { queryParams: { slug: s.slug } });
  }
}
