from django.urls import path
from . import views

urlpatterns = [
    path('', views.prompt_list, name='prompt-list'),
    path('<int:prompt_id>/', views.prompt_detail, name='prompt-detail'),
]
