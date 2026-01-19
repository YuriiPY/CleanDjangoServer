from django.db import models

class ScrapedArticle(models.Model):
    title = models.CharField(max_length=500)
    link = models.URLField(max_length=500, unique=True)
    date_published = models.DateField(null=True, blank=True)
    content = models.TextField(blank=True, null=True)
    pdf_file = models.FileField(upload_to='pdfs/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
