import { Component } from '@angular/core';
import { Card } from 'primeng/card';
import { NgForOf } from '@angular/common';
import { PrimeTemplate } from 'primeng/api';

@Component({
  selector: 'app-dashboard',
  imports: [
    Card,
    NgForOf,
    PrimeTemplate
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  cards = Array.from({ length: 144 }, (_, i) => i + 1); // 12 rows × 12 columns = 144 cards
}
