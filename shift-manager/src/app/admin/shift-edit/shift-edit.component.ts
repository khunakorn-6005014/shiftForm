import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-shift-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shift-edit.component.html',
  styleUrl: './shift-edit.component.scss'
})
export class AdminShiftFormComponent  implements OnInit {
  STORAGE_KEY = 'shifts';

  loggedInUser: string | null = localStorage.getItem('loggedInUser');
  date = '';
  startTime = '';
  endTime = '';
  hourlyWage: number | null = null;
  place = '';
  slug = '';
  comments = '';

  isEditMode = false;
  originalSlug: string | null = null;

  // error messages
  dateError = '';
  timeError = '';
  wageError = '';
  placeError = '';
  slugError = '';

  showSpinner = false;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    const slugParam = this.route.snapshot.queryParamMap.get('slug');
    const shifts = this.loadShifts();

    if (slugParam) {
      const shift = shifts.find(s => s.slug === slugParam);
      if (shift) {
        this.isEditMode = true;
        this.originalSlug = slugParam;
        this.date = shift.date;
        this.startTime = shift.startTime;
        this.endTime = shift.endTime;
        this.hourlyWage = +shift.hourlyWage;
        this.place = shift.place;
        this.slug = shift.slug;
        this.comments = shift.comments;
      }
    }
  }

  loadShifts(): any[] {
    const json = localStorage.getItem(this.STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  }

  saveShifts(arr: any[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(arr));
  }

  validateTime(): void {
    this.timeError = '';
    if (this.startTime && this.endTime && this.endTime <= this.startTime) {
      this.timeError = 'End must be after start.';
    }
  }

  validateSlug(): void {
    const shifts = this.loadShifts();
    const trimmed = this.slug.trim();
    const clash = shifts.some(s => s.slug === trimmed && trimmed !== this.originalSlug);
    this.slugError = trimmed ? (clash ? 'Slug already exists. Choose another.' : '') : 'Slug is required.';
  }

  onSubmit(): void {
    this.dateError = this.date ? '' : 'Please select a date.';
    this.validateTime();
    this.wageError = !this.hourlyWage || this.hourlyWage <= 0 ? 'Hourly wage must be > 0.' : '';
    this.placeError = this.place ? '' : 'Select a workplace.';
    this.validateSlug();

    if (this.dateError || this.timeError || this.wageError || this.placeError || this.slugError) {
      return;
    }

    const shift = {
      user: this.loggedInUser,
      date: this.date,
      startTime: this.startTime,
      endTime: this.endTime,
      hourlyWage: this.hourlyWage,
      place: this.place,
      slug: this.slug.trim(),
      comments: this.comments.trim()
    };

    this.showSpinner = true;

    setTimeout(() => {
      let shifts = this.loadShifts();
      if (this.isEditMode) {
        shifts = shifts.map(s => s.slug === this.originalSlug ? shift : s);
      } else {
        shifts = shifts.filter(s => s.slug !== shift.slug);
        shifts.push(shift);
      }
      this.saveShifts(shifts);
      this.showSpinner = false;
      this.router.navigate(['admin/shifts']);
    }, 500);
  }

  cancel(): void {
    this.router.navigate(['admin/shifts']);
  }
}