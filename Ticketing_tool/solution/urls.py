# urls.py
from django.urls import path
from .views import SolutionAPI,search_solutions

urlpatterns = [
    path('create/', SolutionAPI.as_view(), name='solution-list-create'),  
    path('solutions/<str:pk>/', SolutionAPI.as_view(), name='solution-detail'),  
    path('solution_search/', search_solutions, name='search_solutions'),

]
