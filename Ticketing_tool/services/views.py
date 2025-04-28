from django.shortcuts import render

# Create your views here.
# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import IssueCategory, IssueType
from .serializers import IssueCategorySerializer, IssueTypeSerializer

class IssueCategoryListAPIView(APIView):
    def get(self, request):
        categories = IssueCategory.objects.all()
        serializer = IssueCategorySerializer(categories, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    def post(self, request):
        serializer = IssueCategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def put(self, request,issue_category_id):
        try:
            category = IssueCategory.objects.get(pk=issue_category_id)
        except IssueCategory.DoesNotExist:
            return Response({"error": "Category not found"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = IssueCategorySerializer(category, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def delete(self, request, *args, **kwargs):
        category_id = kwargs.get('issue_category_id')
        if not category_id:
            return Response({"error": "Category ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            category = IssueCategory.objects.get(id=category_id)
            category.delete()
            return Response({"message": "Category deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        except IssueCategory.DoesNotExist:
            return Response({"error": "Category not found."}, status=status.HTTP_404_NOT_FOUND)
class IssueTypeListAPIView(APIView):
    def get(self, request, category_id):
        try:
            category = IssueCategory.objects.get(id=category_id)
        except IssueCategory.DoesNotExist:
            return Response({"error": "Category not found"}, status=status.HTTP_404_NOT_FOUND)
        issue_types = category.issue_types.all()
        serializer = IssueTypeSerializer(issue_types, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    def get(self, request):
        issue_types = IssueType.objects.all()
        serializer = IssueTypeSerializer(issue_types, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self,request):
        serializer = IssueTypeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, pk):
        try:
            issue_type = IssueType.objects.get(pk=pk)
        except IssueType.DoesNotExist:
            return Response({"error": "Issue Type not found"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = IssueTypeSerializer(issue_type, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def delete(self, request, *args, **kwargs):
        category_id = kwargs.get('category_id')
        if category_id is None:
            return Response({"error": "Category ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Assuming you have a model IssueType
        try:
            issue_type = IssueType.objects.get(id=category_id)
            issue_type.delete()
            return Response({"message": "Issue type deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        except IssueType.DoesNotExist:
            return Response({"error": "Issue type not found."}, status=status.HTTP_404_NOT_FOUND)