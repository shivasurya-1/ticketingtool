
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
from .models import ProjectsDetails,ProjectMember, ProjectAttachment
from django.core.files.storage import default_storage



import logging

logger = logging.getLogger(__name__)

class ProjectDetailsAPI(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    # def post(self, request):
    #     # self.permission_required = "create_resolution"
    
    #     # if not HasRolePermission().has_permission(request, self.permission_required):
    #     #  return Response({'error': 'Permission denied.'}, status=403)
    #     org = request.user.organisation
    #     print(org)
    #     serializer = ProjectsSerializer(data=request.data)
    #     if serializer.is_valid():
    #         serializer.save(organisation=org,created_by=request.user)
    #         return Response(serializer.data, status=status.HTTP_201_CREATED)
    #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    # def post(self, request):
    #     files = request.FILES.getlist('file')
    #     file_paths = []
    #     for file in files:
    #         path = default_storage.save(f'attachments/{file.name}', file)
    #         file_paths.append(path)
        
    #     serializer = ProjectsSerializer(data=request.data)
    #     if serializer.is_valid():
    #         serializer.save(files=file_paths, created_by=request.user, organisation=request.user.organisation)
    #         return Response(serializer.data, status=status.HTTP_201_CREATED)

    def post(self, request):
        files = request.FILES.getlist('files')  # expecting form-data key 'file' as a list of files

        serializer = ProjectsSerializer(data=request.data)
        if serializer.is_valid():
            project = serializer.save(
                created_by=request.user,
                organisation=request.user.organisation
            )

            # Save each attachment
            for file in files:
                ProjectAttachment.objects.create(
                    project=project,
                    file=file,
                    uploaded_by=request.user
                )

            return Response(ProjectsSerializer(project).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # def get(self, request, project_id=None):
    #     # self.permission_required = "view_organization"
    
    #     # if not HasRolePermission().has_permission(request, self.permission_required):
    #     #  return Response({'error': 'Permission denied.'}, status=403)
    #     # print("done")

    #     # logger.info("OrganizationList view was called")
    #     #email, assignee, project
    #     user_org = request.user.organisation
    #     try:
    #         ids= Employee.objects.filter(organisation=user_org).values_list('user_role_id__user_id__username', flat=True).distinct()

            
    #         # return Response([i for i in ids])

    #         projects = ProjectsDetails.objects.filter(organisation=user_org)
    #         serializer = ProjectsSerializer(projects,many=True)
    #         project_members = ProjectMember.objects.all()
    #         project_members_serializer = ProjectsMembersSerializer(project_members,many = True)
            
    #         final_data=[{'all_project':serializer.data}]
    #         result = [{"name": k, "assigned_projects": [d["project_name_name"] for d in v]} for k, v in itertools.groupby(sorted(project_members_serializer.data, key=lambda x: x["project_asignee_username"]), key=lambda x: x["project_asignee_username"])]
    #         final_data.append({'assigned_projects':result})
    #         final_data.append({'requestor_ids':[ i for i in ids]})
    #         return Response(final_data)
    #     except Organisation.DoesNotExist:
    #         return Response({"error": "Organisation not found."}, status=status.HTTP_404_NOT_FOUND)


    def get(self, request, project_id=None):
        try:
            ids = Employee.objects.values_list(
                'user_role_id__user_id__username', flat=True
            ).distinct()

            if project_id:
                project = get_object_or_404(ProjectsDetails, pk=project_id)
                serializer = ProjectsSerializer(project)
                return Response(serializer.data, status=status.HTTP_200_OK)

            projects = ProjectsDetails.objects.all()
            serializer = ProjectsSerializer(projects, many=True)

            project_members = ProjectMember.objects.all()
            project_members_serializer = ProjectsMembersSerializer(project_members, many=True)

            final_data = [{'all_project': serializer.data}]

            result = [
                {
                    "name": k,
                    "assigned_projects": [d["project_name_name"] for d in v]
                }
                for k, v in itertools.groupby(
                    sorted(project_members_serializer.data, key=lambda x: x["project_asignee_username"]),
                    key=lambda x: x["project_asignee_username"]
                )
            ]

            final_data.append({'assigned_projects': result})
            final_data.append({'requestor_ids': list(ids)})

            return Response(final_data)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    # def get(self, request, project_id=None):
    #     user_org = request.user.organisation

    #     try:
    #         # Get requestor usernames
    #         ids = Employee.objects.filter(organisation=user_org).values_list(
    #             'user_role_id__user_id__username', flat=True
    #         ).distinct()

    #         # If project_id is provided, return a single project record
    #         if project_id:
    #             project = get_object_or_404(ProjectsDetails, pk=project_id, organisation=user_org)
    #             serializer = ProjectsSerializer(project)
    #             return Response(serializer.data, status=status.HTTP_200_OK)

    #         # Else return all projects
    #         projects = ProjectsDetails.objects.filter(organisation=user_org)
    #         serializer = ProjectsSerializer(projects, many=True)

    #         project_members = ProjectMember.objects.all()
    #         project_members_serializer = ProjectsMembersSerializer(project_members, many=True)

    #         final_data = [{'all_project': serializer.data}]

    #         result = [
    #             {
    #                 "name": k,
    #                 "assigned_projects": [d["project_name_name"] for d in v]
    #             }
    #             for k, v in itertools.groupby(
    #                 sorted(project_members_serializer.data, key=lambda x: x["project_asignee_username"]),
    #                 key=lambda x: x["project_asignee_username"]
    #             )
    #         ]

    #         final_data.append({'assigned_projects': result})
    #         final_data.append({'requestor_ids': list(ids)})

    #         return Response(final_data)

    #     except Organisation.DoesNotExist:
    #         return Response({"error": "Organisation not found."}, status=status.HTTP_404_NOT_FOUND)
    

        
    def put(self, request, project_id):
        resolution = get_object_or_404(ProjectsDetails, pk=project_id)
        serializer = ProjectsSerializer(resolution, data=request.data, partial=True)

        if serializer.is_valid():
            updated_project = serializer.save(modified_by=request.user)

            # Handle attachments
            uploaded_files = request.FILES.getlist('files')  # 'files' must match the form input name

            for file in uploaded_files:
                ProjectAttachment.objects.create(
                    project=updated_project,
                    files=file,  # ✅ correct keyword for the model's field
                    uploaded_by=request.user
                )

            return Response(ProjectsSerializer(updated_project).data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




class ProjectDashDetailsAPI(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
   
    
    # def get(self, request, project_id=None):
    #     # self.permission_required = "view_organization"
    
    #     # if not HasRolePermission().has_permission(request, self.permission_required):
    #     #  return Response({'error': 'Permission denied.'}, status=403)
    #     # print("done")

    #     # logger.info("OrganizationList view was called")
    #     #email, assignee, project
    #     user_org = request.user.organisation
    #     print(user_org)
        

    #     try:
    #         ids= Employee.objects.filter(organisation=user_org).values_list('user_role_id__user_id__username', flat=True).distinct()

            
    #         # return Response([i for i in ids])

    #         projects = ProjectsDetails.objects.filter(organisation=user_org)
    #         serializer = ProjectsDashSerializer(projects,many=True)
    #         project_members = ProjectMember.objects.all()
    #         project_members_serializer = ProjectsMembersSerializer(project_members,many = True)
            
    #         final_data=[{'data':serializer.data}]

    #         return Response(serializer.data)
    #     except Organisation.DoesNotExist:
    #         return Response({"error": "Organisation not found."}, status=status.HTTP_404_NOT_FOUND)
    def get(self, request, project_id=None):
        try:
            projects = ProjectsDetails.objects.all()
            serializer = ProjectsDashSerializer(projects, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    



class UserProjectDetailsAPI(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
   
    
    # def get(self, request, projects_id=None):
    #     # self.permission_required = "view_organization"
    
    #     # if not HasRolePermission().has_permission(request, self.permission_required):
    #     #  return Response({'error': 'Permission denied.'}, status=403)
    #     # print("done")

    #     # logger.info("OrganizationList view was called")
    #     #email, assignee, project
    #     user_org = request.user.organisation
    #     user_org_id = request.user.organisation_id
    #     print(user_org)
        

    #     try:
      
    #         project_members = ProjectMember.objects.filter(project_asignee =request.user.id)
    #         project_members_serializer = ProjectsMembersSerializer(project_members,many = True)

            
    #         final_data=[]
    #         for i in project_members_serializer.data:
    #             if i not in final_data:
    #                 final_data.append(i['project_name_name'])
    #         return Response(final_data)
    #     except Organisation.DoesNotExist:
    #         return Response({"error": "Organisation not found."}, status=status.HTTP_404_NOT_FOUND)


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












#     # POST: Create a new organisation 
#     def post(self, request):
#         self.permission_required = "create_users"
    
#         if not HasRolePermission().has_permission(request, self.permission_required):
#          return Response({'error': 'Permission denied.'}, status=403)

       
#         serializer = OrganisationSerializer(data=request.data)
#         if serializer.is_valid():
#             organisation = serializer.save(created_by=request.user, modified_by=request.user)
#             send_organisation_creation_email.delay(
#                 organisation.organisation_name,
#                 organisation.organisation_mail
#             )
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     # PUT: Update an existing organisation
#     def put(self, request, organisation_id=None):
#         self.permission_required = "update_organization"
    
#         if not HasRolePermission().has_permission(request, self.permission_required):
#          return Response({'error': 'Permission denied.'}, status=403)
#         try:
#             organisation = Organisation.objects.get(organisation_id=organisation_id)
#         except Organisation.DoesNotExist:
#             return Response({"error": "Organisation not found."}, status=status.HTTP_404_NOT_FOUND)

#         serializer = OrganisationSerializer(organisation, data=request.data)
#         if serializer.is_valid():
#             organisation = serializer.save(created_by=request.user, modified_by=request.user)
#             return Response(serializer.data)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     # DELETE: Delete an organisation
#     def delete(self, request, organisation_id=None):
#         self.permission_required = "delete_organization"
    
#         if not HasRolePermission().has_permission(request, self.permission_required):
#          return Response({'error': 'Permission denied.'}, status=403)
#         try:
#             organisation = Organisation.objects.get(organisation_id=organisation_id)
#             organisation.delete()
#             return Response(status=status.HTTP_204_NO_CONTENT)
#         except Organisation.DoesNotExist:
#             return Response({"error": "Organisation not found."}, status=status.HTTP_404_NOT_FOUND)
        



# class EmployeeAPI(APIView):
#     permission_classes = [IsAuthenticated]
#     authentication_classes = [JWTAuthentication]

#     def get(self, request, organisation_id=None, employee_id=None):
#         self.permission_required = "view_employee"  
#         HasRolePermission.has_permission(self,request,self.permission_required)
#         """Handles fetching employees for a specific organisation or a single employee"""
#         if organisation_id:
#             employees = Employee.objects.filter(organisation_id=organisation_id)
#             serializer = EmployeeSerializer(employees, many=True)
#             return Response(serializer.data, status=status.HTTP_200_OK)

#         elif employee_id:
#             try:
#                 employee = Employee.objects.get(id=employee_id)
#                 serializer = EmployeeSerializer(employee)
#                 return Response(serializer.data, status=status.HTTP_200_OK)
#             except Employee.DoesNotExist:
#                 return Response({"error": "Employee not found."}, status=status.HTTP_404_NOT_FOUND)

#         return Response({"error": "Invalid request."}, status=status.HTTP_400_BAD_REQUEST)
    

#     def post(self, request, organisation_id=None):
#         self.permission_required = "create_employee"  
#         HasRolePermission.has_permission(self,request,self.permission_required) 
#         """
#         Create an employee. If `organisation_id` is provided in the URL,
#         it will automatically associate the employee with that organisation.
#         """
#         if organisation_id:
#             # Attach organisation ID from URL if provided
#             request.data["organisation"] = organisation_id

#         serializer = EmployeeSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save(created_by=request.user, modified_by=request.data)
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
        
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     def put(self, request, employee_id):
#         self.permission_required = "update_employee"  
#         HasRolePermission.has_permission(self,request,self.permission_required) 
#         employee = get_object_or_404(Employee, id=employee_id)
#         serializer = EmployeeSerializer(employee, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save(created_by=request.user, modified_by=request.data)
#             return Response(serializer.data)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     def delete(self, request, employee_id):
#         self.permission_required = "delete_employee"  
#         HasRolePermission.has_permission(self,request,self.permission_required)
#         employee = get_object_or_404(Employee, id=employee_id)
#         employee.delete()
#         return Response(status=status.HTTP_204_NO_CONTENT)


