from django.urls import path
from .views import ScrapeView, ArticleListView

urlpatterns = [
    path('run/', ScrapeView.as_view(), name='run_scraper'),
    path('list/', ArticleListView.as_view(), name='list_articles'),
]
