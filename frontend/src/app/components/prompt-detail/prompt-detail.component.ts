import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PromptService, Prompt } from '../../services/prompt.service';

@Component({
  selector: 'app-prompt-detail',
  templateUrl: './prompt-detail.component.html'
})
export class PromptDetailComponent implements OnInit {
  prompt: Prompt | null = null;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private promptService: PromptService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.promptService.getPrompt(id).subscribe({
      next: (data) => {
        this.prompt = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Prompt not found or server error.';
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
    if (c <= 3) return `Low · ${c}/10`;
    if (c <= 6) return `Medium · ${c}/10`;
    return `High · ${c}/10`;
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });
  }
}
