from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from .models import Resolution
from .serializers import ResolutionSerializer
from roles_creation.permissions import HasRolePermission
from rest_framework_simplejwt.authentication import JWTAuthentication

class ResolutionAPIView(APIView):
    permission_classes = [IsAuthenticated,HasRolePermission]
    authentication_classes = [JWTAuthentication]


    def get(self, request, pk=None):
       self.permission_required = "view_resolution"
       if not HasRolePermission().has_permission(request, self.permission_required):
         return Response({'detail': 'Permission denied.'}, status=403)
       
       if pk:
            resolution = get_object_or_404(Resolution, pk=pk)
            serializer = ResolutionSerializer(resolution)
       else:
            resolutions = Resolution.objects.all()
            serializer = ResolutionSerializer(resolutions, many=True)
       return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        self.permission_required = "create_resolution"
    
        if not HasRolePermission().has_permission(request, self.permission_required):
         return Response({'detail': 'Permission denied.'}, status=403)
        serializer = ResolutionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=request.user, updated_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        self.permission_required = "update_resolution"
    
        if not HasRolePermission().has_permission(request, self.permission_required):
         return Response({'detail': 'Permission denied.'}, status=403)
        resolution = get_object_or_404(Resolution, pk=pk)
        serializer = ResolutionSerializer(resolution, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(updated_by=request.user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        self.permission_required = "delete_resolution"
    
        if not HasRolePermission().has_permission(request, self.permission_required):
         return Response({'detail': 'Permission denied.'}, status=403)
        resolution = get_object_or_404(Resolution, pk=pk)
        resolution.delete()
        return Response({"message": "Resolution deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

class ResolutionChoicesAPIView(APIView):
    def get(self, request):
        choices = {
            "resolution_type_choices": Resolution.resolution_choices,
            "incident_based_on_choices": Resolution.incident_choices,
            "incident_category_choices": Resolution.incident_category_choices,
        }
        return Response(choices)