from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Solution
from .serializers import SolutionSerializer
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.permissions import AllowAny
from roles_creation.permissions import HasRolePermission
from rest_framework_simplejwt.authentication import JWTAuthentication

class SolutionAPI(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    # def get(self, request, pk=None):
    #     self.required_permission = "view_solution"    
    #     self.check_permissions(request) 
    #     if pk is not None:
    #         solution = get_object_or_404(Solution, pk=pk)
    #         serializer = SolutionSerializer(solution)
    #     else:
    #         solutions = Solution.objects.all()
    #         serializer = SolutionSerializer(solutions, many=True)  # Serialize multiple objects
        
    #     return Response(serializer.data, status=status.HTTP_200_OK)
    
    # def get(self, request):
    #     self.required_permission = "view_solution"  
    #     self.check_permissions(request) 
    #     solutions = Solution.objects.all()
    #     serializer = SolutionSerializer(solutions, many=True)
    #     return Response(serializer.data)
    
    def get(self, request, pk=None):
        self.permission_required = "view_resolution"
        if not HasRolePermission().has_permission(request, self.permission_required):
         return Response({'detail': 'Permission denied.'}, status=403) 
        
        solutions = Solution.objects.filter(ticket=pk) 
        
        if solutions.exists():
            serializer = SolutionSerializer(solutions, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response({"detail": "Solution not found."}, status=status.HTTP_404_NOT_FOUND)
    
    

    
    def post(self, request):
        self.permission_required = "create_resolution"
        if not HasRolePermission().has_permission(request, self.permission_required):
         return Response({'detail': 'Permission denied.'}, status=403) 
        print(request.data)  
        serializer = SolutionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201) 
        return Response(serializer.errors, status=400)

    def put(self, request, pk):
        self.permission_required = "update_resolution"
        if not HasRolePermission().has_permission(request, self.permission_required):
         return Response({'detail': 'Permission denied.'}, status=403) 
        solution = get_object_or_404(Solution, pk=pk)
        serializer = SolutionSerializer(solution, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    def delete(self, request, pk):
        self.permission_required = "delete_resolution"
        if not HasRolePermission().has_permission(request, self.permission_required):
         return Response({'detail': 'Permission denied.'}, status=403)
        solution = get_object_or_404(Solution, pk=pk)
        solution.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    




from django.db.models import Q, Subquery, OuterRef
from rest_framework.decorators import api_view

@api_view(['GET'])
def search_solutions(request):
    query = request.GET.get('q', '')
    subquery_param = request.GET.get('subquery', '')
    
    solutions = Solution.objects.all()

    if query:
        solutions = solutions.filter(
            Q(solution_text__icontains=query) |
            Q(ticket__summary__icontains=query) |
            Q(user__username__icontains=query) |
            Q(created_by__username__icontains=query) |
            Q(updated_by__username__icontains=query)
        )

    if subquery_param:
        subquery = Solution.objects.filter(
            created_by=OuterRef('created_by'),
            solution_text__icontains=subquery_param
        ).values('created_by')
        
        solutions = solutions.filter(
            created_by__in=Subquery(subquery)
        )

    serializer = SolutionSerializer(solutions, many=True)
    return Response(serializer.data)