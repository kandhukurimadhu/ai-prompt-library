import { Component, OnInit } from '@angular/core';
import { PromptService, Prompt } from '../../services/prompt.service';

@Component({
  selector: 'app-prompt-list',
  templateUrl: './prompt-list.component.html'
})
export class PromptListComponent implements OnInit {
  prompts: Prompt[] = [];
  loading = true;
  error = '';

  constructor(private promptService: PromptService) {}

  ngOnInit(): void {
    this.promptService.getPrompts().subscribe({
      next: (data) => {
        this.prompts = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load prompts. Is the backend running?';
        this.loading = false;
      }
    });
  }

  complexityClass(c: number): string {
    if (c <= 3) return 'complexity-low';
    if (c <= 6) return 'complexity-medium';
    return 'complexity-high';
  }

  complexityLabel(c: number): string {
    if (c <= 3) return `Low · ${c}`;
    if (c <= 6) return `Med · ${c}`;
    return `High · ${c}`;
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  }
}
