
import itertools
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from login_details.models import User
from organisation_details.models import Organisation, Employee
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.shortcuts import get_object_or_404
from organisation_details.serializers import OrganisationSerializer
from organisation_details.tasks import send_organisation_creation_email
from project_details.serializers import ProjectsDashSerializer,ProjectsSerializer,ProjectsMembersSerializer
from roles_creation.permissions import HasRolePermission
from .models import ProjectsDetails,ProjectMember


import logging

logger = logging.getLogger(__name__)

class ProjectDetailsAPI(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    def post(self, request):
        # self.permission_required = "create_resolution"
    
        # if not HasRolePermission().has_permission(request, self.permission_required):
        #  return Response({'error': 'Permission denied.'}, status=403)
        org = request.user.organisation
        print(org)
        serializer = ProjectsSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(organisation=org,created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    # def get(self, request, projects_id=None):
       
    #     user_org = request.user.organisation
    #     try:
    #         ids= Employee.objects.filter(organisation=user_org).values_list('user_role_id__user_id__username', flat=True).distinct()

            
    #         # return Response([i for i in ids])

    #         projects = ProjectsDetails.objects.filter(organisation=user_org)
    #         serializer = ProjectsSerializer(projects,many=True)
    #         project_members = ProjectMember.objects.all()
    #         project_members_serializer = ProjectsMembersSerializer(project_members,many = True)
            
    #         final_data=[{'data':serializer.data}]
    #         result = [{"name": k, "projects": [d["project_name_name"] for d in v]} for k, v in itertools.groupby(sorted(project_members_serializer.data, key=lambda x: x["project_asignee_username"]), key=lambda x: x["project_asignee_username"])]
    #         final_data.append({'projects':result})
    #         final_data.append({'requestor_ids':[ i for i in ids]})
    #         return Response(final_data)
    #     except Organisation.DoesNotExist:
    #         return Response({"error": "Organisation not found."}, status=status.HTTP_404_NOT_FOUND)

    def get(self, request, projects_id=None):
        user_org = request.user.organisation
        try:
            # Get distinct usernames from employee roles in the organisation
            ids = Employee.objects.filter(
                organisation=user_org
            ).values_list('user_role_id__user_id__username', flat=True).distinct()

            # Serialize projects for this organisation
            projects = ProjectsDetails.objects.filter(organisation=user_org)
            serializer = ProjectsSerializer(projects, many=True)

            # Serialize all project members
            project_members = ProjectMember.objects.all()
            project_members_serializer = ProjectsMembersSerializer(project_members, many=True)

            # Prepare final data output
            final_data = [{'data': serializer.data}]

            # Sort and group members by first assignee username
            sorted_members = sorted(
                project_members_serializer.data,
                key=lambda x: x.get("project_asignees", [""])[0]  # Get first assignee username
            )

            result = [
                {
                    "name": key,
                    "projects": [member["project_name"] for member in group]
                }
                for key, group in itertools.groupby(
                    sorted_members,
                    key=lambda x: x.get("project_asignees", [""])[0]
                )
            ]

            final_data.append({'projects': result})
            final_data.append({'requestor_ids': list(ids)})

            return Response(final_data)

        except Organisation.DoesNotExist:
            return Response({"error": "Organisation not found."}, status=status.HTTP_404_NOT_FOUND)
        
    def put(self, request, pk):
        # self.permission_required = "update_projects"
    
        # if not HasRolePermission().has_permission(request, self.permission_required):
        #  return Response({'error': 'Permission denied.'}, status=403)
        resolution = get_object_or_404(ProjectsDetails, pk=pk)
        serializer = ProjectsSerializer(resolution, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(updated_by=request.user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

  
  



class ProjectDashDetailsAPI(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
   
    
    def get(self, request, projects_id=None):
        # self.permission_required = "view_organization"
    
        # if not HasRolePermission().has_permission(request, self.permission_required):
        #  return Response({'error': 'Permission denied.'}, status=403)
        # print("done")

        # logger.info("OrganizationList view was called")
        #email, assignee, project
        user_org = request.user.organisation
        print(user_org)
        

        try:
            ids= Employee.objects.filter(organisation=user_org).values_list('user_role_id__user_id__username', flat=True).distinct()

            
            # return Response([i for i in ids])

            projects = ProjectsDetails.objects.filter(organisation=user_org)
            serializer = ProjectsDashSerializer(projects,many=True)
            project_members = ProjectMember.objects.all()
            project_members_serializer = ProjectsMembersSerializer(project_members,many = True)
            
            final_data=[{'data':serializer.data}]

            return Response(serializer.data)
        except Organisation.DoesNotExist:
            return Response({"error": "Organisation not found."}, status=status.HTTP_404_NOT_FOUND)
    



class UserProjectDetailsAPI(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
   
    
    def get(self, request, projects_id=None):
        # self.permission_required = "view_organization"
    
        # if not HasRolePermission().has_permission(request, self.permission_required):
        #  return Response({'error': 'Permission denied.'}, status=403)
        # print("done")

        # logger.info("OrganizationList view was called")
        #email, assignee, project
        user_org = request.user.organization
        user_org_id = request.user.organization_id
        print(user_org)
        

        try:
      
            project_members = ProjectMember.objects.filter(project_asignee =request.user.id)
            project_members_serializer = ProjectsMembersSerializer(project_members,many = True)

            
            final_data=[]
            for i in project_members_serializer.data:
                if i not in final_data:
                    final_data.append(i['project_name_name'])
            return Response(final_data)
        except Organisation.DoesNotExist:
            return Response({"error": "Organisation not found."}, status=status.HTTP_404_NOT_FOUND)
        

    def get(self, request, projects_id=None):
        user_org = request.user.organisation
        if not user_org:
            return Response({"error": "User's organisation is not set."}, status=status.HTTP_400_BAD_REQUEST)
 
        try:
            project_members = ProjectMember.objects.filter(project_asignee=request.user.id)
            project_members_serializer = ProjectsMembersSerializer(project_members, many=True)
 
            final_data = list({i['project_name_name'] for i in project_members_serializer.data})
            return Response(final_data)
 
        except Organisation.DoesNotExist:
            return Response({"error": "Organisation not found."}, status=status.HTTP_404_NOT_FOUND)
 


 
class ProjectMemberAPI(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
 
    def get(self, request, project_id=None):
        self.permission_required = "view_project_details"
        if not HasRolePermission().has_permission(request, self.permission_required):
          return Response({'error': 'Permission denied.'}, status=403)
        try:
            if project_id:
                project_members = ProjectMember.objects.filter(project_name=project_id)
                serializer = ProjectsMembersSerializer(project_members, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
 
            project_members = ProjectMember.objects.all()
            serializer = ProjectsMembersSerializer(project_members, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ProjectMember.DoesNotExist:
            return Response({"error": "Project members not found."}, status=status.HTTP_404_NOT_FOUND)
   
    def post(self, request):    
        self.permission_required = "create_project_details"
        if not HasRolePermission().has_permission(request, self.permission_required):
            return Response({'error': 'Permission denied.'}, status=403)
 
        print("Incoming data:", request.data)  # 👈 Add this line to inspect data
 
        serializer = ProjectsMembersSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=request.user, modified_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def put (self, request, assigned_project_id):
        self.permission_required = "update_project_details"
        if not HasRolePermission().has_permission(request, self.permission_required):
            return Response({'error': 'Permission denied.'}, status=403)
        try:
            project_member = get_object_or_404(ProjectMember, pk=assigned_project_id)
            serializer = ProjectsMembersSerializer(project_member, data=request.data, partial=True)
 
            if serializer.is_valid():
                updated_project_member = serializer.save(modified_by=request.user)
                return Response(ProjectsMembersSerializer(updated_project_member).data, status=status.HTTP_200_OK)
 
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except ProjectMember.DoesNotExist:
            return Response({"error": "Project member not found."}, status=status.HTTP_404_NOT_FOUND)
       
    def delete(self, request, assigned_project_id):
        self.permission_required = "delete_project_details"
        if not HasRolePermission().has_permission(request, self.permission_required):
            return Response({'error': 'Permission denied.'}, status=403)
        try:
            project_member = get_object_or_404(ProjectMember, pk=assigned_project_id)
            project_member.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProjectMember.DoesNotExist:
            return Response({"error": "Project member not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
 
 
 











