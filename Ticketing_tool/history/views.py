from django.shortcuts import render
from rest_framework.views import APIView
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from datetime import timedelta
from roles_creation.permissions import HasRolePermission
from .serializers import TicketHistorySerializer,ReportSerializer,AttachmentSerializer
from .models import History,Reports,Attachment



class HistoryAPI(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request, ticket=None):
        # self.permission_required = "view_employee"  
        # HasRolePermission.has_permission(self,request,self.permission_required)
        
        
        try:
            ticket = request.data['ticket']
            print(ticket)
            history = History.objects.filter(ticket=ticket)
            serializer = TicketHistorySerializer(history, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except:
          return Response({"error": "Invalid request."}, status=status.HTTP_400_BAD_REQUEST)
    
 

    def post(self, request, *args, **kwargs):
            serializer = TicketHistorySerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(modified_by=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
          
class ReportAPI(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        ticket = request.query_params.get('ticket')
        if not ticket:
            return Response({"error": "Ticket parameter is required"},status=status.HTTP_400_BAD_REQUEST)
        try:
            report = Reports.objects.filter(ticket=ticket)
            if not report.exists():
                return Response({"error": "No reports found for the given ticket"},status=status.HTTP_404_NOT_FOUND)
            serializer = ReportSerializer(report, many=True,context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"An error occurred: {str(e)}"},status=status.HTTP_400_BAD_REQUEST)
 
    def post(self, request, *args, **kwargs):
            serializer = ReportSerializer(data=request.data,context={'request': request})
            if serializer.is_valid():
                serializer.save(modified_by=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
class AttachmentsAPI(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        # self.permission_required = "view_employee"  
        # HasRolePermission.has_permission(self,request,self.permission_required)
       
        if 1:
            ticket=request.query_params.get('ticket')
            print(ticket)
            report = Attachment.objects.filter(ticket=ticket)
            serializer = AttachmentSerializer(report, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
          return Response({"error": "Invalid request."}, status=status.HTTP_400_BAD_REQUEST)
    