from django.urls import path
from .views import KnowledgeAPI,search_knowledge_articles

urlpatterns = [
    path('knowledge_create/', KnowledgeAPI.as_view(), name='knowledge-article-list'),
    path('knowledge/<int:article_id>/', KnowledgeAPI.as_view(), name='knowledge-article-detail'),
    # path('ka/knowledge/<uuid:article_id>/', KnowledgeAPI.as_view(), name='knowledge_detail'),
    path('knowledge_articles/search/', search_knowledge_articles, name='search_knowledge_articles'),
]
