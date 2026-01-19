from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import ScrapedArticle
from .serializers import ScrapedArticleSerializer
from .scraper_service import run_scraper
import threading

class ScrapeView(APIView):
    def post(self, request):
        query = request.data.get('query', 'chopin')
        start_date = request.data.get('start_date', '01.10.2025')
        end_date = request.data.get('end_date', '31.10.2025')
        
        result = run_scraper(query=query, start_date_str=start_date, end_date_str=end_date)
        return Response(result)

class ArticleListView(APIView):
    def get(self, request):
        articles = ScrapedArticle.objects.all().order_by('-date_published')
        serializer = ScrapedArticleSerializer(articles, many=True)
        return Response(serializer.data)
