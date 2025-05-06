from django.shortcuts import render
from rest_framework.views import APIView
from .models import Priority
from rest_framework import status
from rest_framework.response import Response
from .serializers import PrioritySerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from datetime import timedelta
from roles_creation.permissions import HasRolePermission
import re



class PriorityView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def get(self, request, pk=None, *args, **kwargs):
        self.permission_required = "view_priority"
    
        if not HasRolePermission().has_permission(request, self.permission_required):
            return Response({'error': 'Permission denied.'}, status=403)
        print(request.user.organisation)
        print(request.user.organisation)
        print(request.user.organisation)
        print(request.user.organisation)
        print(request.user.organisation)
        print(request.user.organisation)
        print(request.user.organisation)
        
        if pk:
            # Retrieve a single object by pk
            try:
                priority = Priority.objects.get(pk=pk)
                serializer = PrioritySerializer(priority)
                return Response(serializer.data)
            except Priority.DoesNotExist:
                return Response({'error': 'Priority not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            # Retrieve all objects
            priorities = Priority.objects.filter(organisation= request.user.organisation)
            serializer = PrioritySerializer(priorities, many=True)
            return Response(serializer.data)
    
    # def get(self, request, *args, **kwargs):
    #     self.permission_required = "view_priority"
    
    #     if not HasRolePermission().has_permission(request, self.permission_required):
    #         return Response({'error': 'Permission denied.'}, status=403)
    #     # Retrieve all objects
    #     priorities = Priority.objects.all(organisation= request.user.organisation)
    #     serializer = PrioritySerializer(priorities, many=True)
    #     return Response(serializer.data)



    # def get(self, request, *args, **kwargs):
    #     self.permission_required = "view_priority"
    
    #     if not HasRolePermission().has_permission(request, self.permission_required):
    #         return Response({'error': 'Permission denied.'}, status=403)
    #     # Retrieve all objects
    #     priorities = Priority.objects.filter(organisation= request.user.organisation)
    #     serializer = PrioritySerializer(priorities, many=True)
    #     return Response(serializer.data)
    
    


    def parse_duration(self, value):
        """
        Converts '3d', '72h', '1d4h', etc. to timedelta
        """
        pattern = r'(?:(\d+)d)?(?:(\d+)h)?'
        match = re.fullmatch(pattern, value.strip())
        if not match:
            raise ValueError("Invalid duration format. Use 'XdYh' format like '3d', '48h', or '2d4h'.")
 
        days = int(match.group(1)) if match.group(1) else 0
        hours = int(match.group(2)) if match.group(2) else 0
        return timedelta(days=days, hours=hours)
 
    def post(self, request):
        self.permission_required = "create_priority"
      
        if not HasRolePermission().has_permission(request, self.permission_required):
         return Response({'error': 'Permission denied.'}, status=403)
        data = request.data.copy()
        try:
            data['response_target_time'] = self.parse_duration(data.get("response_target_time", "0h"))
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
 
        # Check for existing priority
        existing_priority = Priority.objects.filter(
            urgency_name=data.get("urgency_name"),
            response_target_time=data.get("response_target_time")
        ).first()
 
        if existing_priority:
            return Response({"message": "Priority already exists"}, status=status.HTTP_200_OK)
 
        serializer = PrioritySerializer(data=data, context={'request': request})
        if serializer.is_valid():
            priority = serializer.save(created_by=request.user)
            return Response(PrioritySerializer(priority).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
   
 
 


    def put(self, request, pk, *args, **kwargs):
        self.permission_required = "update_priority"
    
        if not HasRolePermission().has_permission(request, self.permission_required):
         return Response({'error': 'Permission denied.'}, status=403)
        try:
            priority = Priority.objects.get(pk=pk)
        except Priority.DoesNotExist:
            return Response({'error': 'Priority not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = PrioritySerializer(priority, data=request.data, partial=True)
        if serializer.is_valid():
            priority=serializer.save(updated_by=request.user)
            # return Response(serializer.data)
            return Response(serializer.data, status=status.HTTP_200_OK)
            # return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
     

    def delete(self, request, pk): 
        self.permission_required = "delete_priority"
    
        if not HasRolePermission().has_permission(request, self.permission_required):
         return Response({'error': 'Permission denied.'}, status=403)
        try:
            priority = Priority.objects.get(pk=pk)
            priority.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Priority.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        
      

from django.db.models import Q, Subquery, OuterRef
from rest_framework.decorators import api_view


@api_view(['GET'])
def search_priorities(request):
    query = request.GET.get('q', '')
    subquery_param = request.GET.get('subquery', '')
    
    priorities = Priority.objects.all()

    if query:
        priorities = priorities.filter(
            Q(Urgency_name__icontains=query) |
            Q(description__icontains=query) |
            Q(created_by__username__icontains=query) |
            Q(updated_by__username__icontains=query)
        )

    if subquery_param:
        subquery = Priority.objects.filter(
            created_by=OuterRef('created_by'),
            Urgency_name=subquery_param
        ).values('created_by')
        
        priorities = priorities.filter(
            created_by__in=Subquery(subquery)
        )

    serializer = PrioritySerializer(priorities, many=True)
    return Response(serializer.data)
        












        

            

            

            

            






