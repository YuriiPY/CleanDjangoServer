from rest_framework import serializers
from .models import ScrapedArticle

class ScrapedArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScrapedArticle
        fields = '__all__'
