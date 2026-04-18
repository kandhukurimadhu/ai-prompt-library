from django.contrib import admin
from .models import Prompt

@admin.register(Prompt)
class PromptAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'complexity', 'created_at']
    search_fields = ['title', 'content']
