import re
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from history.serializers import TicketHistorySerializer
from django.db.models import Q


from roles_creation.models import UserRole
from roles_creation.serializers import UserRoleSerializer
from organisation_details.serializers import EmployeeSerializer
from organisation_details.models import Employee
from .serializers import SLATimerSerializer,TicketSerializer,AssignTicketSerializer
from .models import Ticket, SLATimer,PauseLogs
from  login_details.serializers import LoginSerializer
from  login_details.models import User
from datetime import timedelta, datetime
from django.shortcuts import render, get_object_or_404
from .tasks import send_ticket_creation_email 
from .tasks import send_assignment_email        # celery---assigning to developer
from rest_framework.exceptions import APIException, NotFound
from django.contrib.auth import get_user_model
User = get_user_model()
from roles_creation.permissions import HasRolePermission
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import LimitOffsetPagination
from .tasks import send_status_change_email_async
from django.db import transaction




def increment_id(id_str):
        match = re.match(r"([A-Za-z]+)(\d+)", id_str)
        if match:
            prefix, num = match.groups()
            new_num = str(int(num) + 1).zfill(len(num))  # Preserve leading zeros
            return f"{prefix}{new_num}"
        return id_str
    
 
# class TicketAPI_Delegated(APIView):
#     def get(self, request):
#         tickets = User.objects.all()

#         login_id = LoginSerializer(tickets,many=True)
#         final_user_list=[ i['username'] for i in login_id.data]
#         tickets = Ticket.objects.filter(status='Delegated')
#         serializer = TicketSerializer(tickets, many=True)
#         final_data=serializer.data
#         final_data['all_assignee']=final_user_list
#         return Response(final_data) 
       

class TicketAPI_Delegated(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def get(self, request):
        
        tickets = User.objects.all()
        login_id = LoginSerializer(tickets,many=True)
        final_user_list=[ {i['id']:i['username']} for i in login_id.data]
        print(login_id.data)
        tickets = Ticket.objects.filter(status='Delegated')
        serializer = TicketSerializer(tickets, many=True)
        final_data=serializer.data
        for i in final_data:
            i['all_assignee']=final_user_list
        return Response(final_data) 

    def post(self, request):
        """POST method to create or update a ticket"""
        ticket_id = request.data.get("ticket_id")
        data = dict(request.data)
        assignee = data.get("assignee")
        new_assignee = data.get("newassignee")
        pre_assignee = data.get("pre_assignee", [])
        if new_assignee[0]  in [pre_assignee][-1]:
            return Response('Cant assign to the same assignee', status=status.HTTP_400_BAD_REQUEST)
        if isinstance(pre_assignee, list):
            pre_assignee = [item for sublist in pre_assignee for item in (sublist if isinstance(sublist, list) else [sublist])]
        if assignee[0] not in pre_assignee:
            pre_assignee.append(assignee[0])
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        
       
        processed_data= {'csrfmiddlewaretoken':request.data['csrfmiddlewaretoken'],
                         'assignee':new_assignee[0],
                         'status':'open',
                         'pre_assignee':pre_assignee,
                         'ticket_id':ticket_id}
        print(processed_data)
        if ticket_id:
            ticket = Ticket.objects.filter(ticket_id=ticket_id).first()
            print(ticket)
            data ={"title":f"{request.username} delegated Ticket", "ticket":ticket_id,"created_by":request.user}

            if ticket:
                serializer = TicketSerializer(ticket, data=processed_data, partial=True
                                              )
                
                if serializer.is_valid():
                    serializer.save()
                    serializer_history = TicketHistorySerializer(data=data)

                    if serializer_history.is_valid():
                        print("history is validadedtdttdtdtddddddddddd")
                        serializer_history.save(modified_by=request.user)
                    else:
                        print("NOOOOOOOOOO")
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # If no `ticket_id`, create a new ticket
        serializer = TicketSerializer(data=request.data)
        if serializer.is_valid():  # ✅ This must be called before accessing `.data`
            serializer.save()
           
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class ReferenceTicketAPILIST(APIView):
    permission_classes = [IsAuthenticated] 
    authentication_classes = [JWTAuthentication]
    def get(self, request):
            # Assuming the related field in the Ticket model is `created_by`
            tickets = Ticket.objects.all()
            serializer = TicketSerializer(tickets, many=True)
            final_data = [{'ticket_id': i['ticket_id'], 'summary': i['summary']} for i in serializer.data]
            return Response(final_data)
        
        
    
class TicketAPIID(APIView):
    def get(self, request):
        try:
            
            data =dict( request.GET)
            org_data = (data['id'][0])
        except:
            org_data = 'S'
        tickets = Ticket.objects.all()
        serializer = TicketSerializer(tickets, many=True)
        final_data = [i['ticket_id'] for i in serializer.data ]
        filtered_data = [item for item in final_data if item.startswith(org_data)]
        if len(filtered_data)==0:
            filtered_data.append(f'{org_data}'+'00000000')
        final_id=sorted(filtered_data)[-1]
        new_id= increment_id(final_id)
        return Response(new_id)  
    
class GetAssignee(APIView):
    def get(self, request):
        try:
            
            data =dict( request.GET)
            org_data = (data['org'][0])
        except:
            org_data = 'All'
        tickets = Employee.objects.filter(organisation__organisation_name=org_data)
        print(tickets)
        serializer = EmployeeSerializer(tickets,many=True)
        
        print(serializer.data)
        d=[]
        for i in serializer.data:
            
            d.append(i['user_role'])
        users = UserRole.objects.filter(user_role_idsin=d)
        users_names= UserRoleSerializer(users,many=True)
        print(users_names.data)
    
        # final_data = [i['ticket_id'] for i in serializer.data ]
        # filtered_data = [item for item in final_data if item.startswith(org_data)]
       
        return Response(users_names.data)  
# class TicketAPIView(APIView):
#     """Handles GET and POST for tickets"""
#     def get(self, request):
#         """get method to get all ticket objects"""
#         tickets = Ticket.objects.all()
#         serializer = TicketSerializer(tickets, many=True)
#         return Response(serializer.data)
from .models import Attachment  
class CreateTicketAPIView(APIView):
    """API for creating a ticket"""

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        self.permission_required = "create_ticket"  
        HasRolePermission.has_permission(self,request,self.permission_required)
        data = request.data.copy()
        data["ticket_id"] = request.data.get("ticket_id")
        data["created_by"] = request.user.id  # Assuming user is logged in and using Token/Auth
        tickets = Ticket.objects.all()

        # ord_data= ""
        # for i in data["ticket_id"]:
        #     if i.isalpha():
        #         ord_data+=i
        #     else:
        #         break
        ticket_id = data.get("ticket_id")

        if ticket_id and isinstance(ticket_id, str):
            ord_data = ""
            for i in ticket_id:
                if i.isalpha():
                    ord_data += i
                else:
                    break
        else:
            return Response({"error": "ticket_id is required and must be a string"}, status=400)
        check_serializer = TicketSerializer(tickets,many=True)
        final_data = [i['ticket_id'] for i in check_serializer.data ]
        if data['ticket_id'] in final_data:
            filtered_data = [item for item in final_data if item.startswith(ord_data)]
            final_id=sorted(filtered_data)[-1]
            new_id= increment_id(final_id)
            data['ticket_id']=new_id
            print(data)
        serializer = TicketSerializer(data=data)
        print("started")
        if str(data['assignee']) != '':
            print("assigneer found")
            data['assignee']=serializer.validate_assignee(data['assignee'])
            data['developer_organization']=serializer.validate_developer_organization(data['developer_organization'])
            data['solution_grp']=serializer.validate_solution_grp(data['solution_grp'])
            serializer_1 = TicketSerializer(data=data)

            if serializer_1.is_valid():
                ticket = serializer_1.save(created_by=request.user)
                engineer_email = ticket.assignee.email if ticket.assignee else None
                # deve = ticket.solution_grp.email if ticket.solution_grp and hasattr(ticket.solution_grp, 'email') else None
                requester_email = ticket.created_by.email if ticket.created_by else None
                developer_organisation = ticket.assignee.organisation.organisation_mail if ticket.assignee else None
                send_ticket_creation_email.delay(
                    ticket.ticket_id,
                    engineer_email,
                    # solution_grp_email,
                    requester_email,
                    developer_organisation

                )
                data ={"title":f"{request.user.username} created Ticket", "ticket":ticket.ticket_id,"created_by":request.user}
                serializer_history = TicketHistorySerializer(data=data)
                if serializer_history.is_valid():
                    serializer_history.save(modified_by=request.user)

                return Response({
                    "message": "Ticket created successfully",
                    "ticket_id": ticket.ticket_id
                }, status=status.HTTP_201_CREATED)
            return Response(serializer_1.errors, status=status.HTTP_400_BAD_REQUEST)

        else:
            print("assigneer not found")
            if serializer.is_valid():
                ticket = serializer.save(created_by=request.user,is_active= False)
            
            
                return Response({
                    "message": "Ticket Sent to Dispatcher successfully",
                    "ticket_id": data['ticket_id']
                }, status=status.HTTP_201_CREATED)
                
                
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    

# class ListTicketAPIView(APIView):

#     permission_classes = [IsAuthenticated]
#     authentication_classes = [JWTAuthentication]
    
#     def get(self, request):
#         self.permission_required = "view_ticket"  
#         HasRolePermission.has_permission(self,request,self.permission_required)
#         print(f"Logged-in user: {request.user}")  # Debugging line
#         print(f"User ID: {request.user.id}")  # Print user ID

#         # Fetch tickets where 'created_by' matches logged-in user's ID
#         tickets = Ticket.objects.filter(created_by=request.user.id) 
#         assigned_tickets = Ticket.objects.filter(assignee_id=request.user.id)
#         totaltickets = tickets.union(assigned_tickets)


#         print(f"Tickets count: {totaltickets.count()}")  # Debugging line

#         if totaltickets.count()<=0:
#             return Response(
#                 {"message": "No tickets found for user {}.".format(request.user.username)}, 
#                 status=200
#             )

#         paginator = LimitOffsetPagination()  # Use built-in pagination
#         paginated_tickets = paginator.paginate_queryset(totaltickets, request, view=self)  
#         serializer = TicketSerializer(paginated_tickets, many=True)  

#         return paginator.get_paginated_response(serializer.data)  


class ListTicketAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request,assignee=None):
        self.permission_required = "view_ticket"
        HasRolePermission.has_permission(self, request, self.permission_required)

        print(f"Logged-in user: {request.user}")
        print(f"User ID: {request.user.id}")
        print(request.query_params.get)
        # If user has Admin role, show all tickets
  

        if UserRole.objects.filter(user=request.user, role__name='Admin',is_active= True).exists():
            all_tickets = Ticket.objects.filter(is_active= True)
            paginator = LimitOffsetPagination()
            paginated = paginator.paginate_queryset(all_tickets, request, view=self)
            serializer = TicketSerializer(paginated, many=True)
            return paginator.get_paginated_response({
                "all_tickets": serializer.data
            })
        # Otherwise, show created and assigned tickets
        created_tickets = Ticket.objects.filter(created_by=request.user,is_active= True)

        assigned_tickets = Ticket.objects.filter(assignee=request.user,is_active= True).exclude(
            ticket_id__in=created_tickets.values_list('ticket_id', flat=True)
        )
        all_tickets_user = Ticket.objects.filter(assignee=request.user,is_active= True)

        paginator_assignee = LimitOffsetPagination()
        paginator_created = LimitOffsetPagination()
        all_paginator=LimitOffsetPagination()
        paginated_created = paginator_created.paginate_queryset(created_tickets, request, view=self)
        paginated_assigned = paginator_assignee.paginate_queryset(assigned_tickets, request, view=self)
        all_paginated_1= all_paginator.paginate_queryset(created_tickets|all_tickets_user, request, view=self)
        all_serializer  = TicketSerializer(all_paginated_1, many=True)
        created_serializer = TicketSerializer(paginated_created, many=True)
        assigned_serializer = TicketSerializer(paginated_assigned, many=True)
  
        if request.query_params.get('created')=='True':
            return paginator_created.get_paginated_response({
                    "all_tickets": created_serializer.data
                })
        if request.query_params.get('assignee')=='True':
            return paginator_assignee.get_paginated_response({
                    "all_tickets": assigned_serializer.data
                })
        else:

            return paginator_created.get_paginated_response({
                    "all_tickets": all_serializer.data
                })      
    
    # def get(self, request, assignee=None):
    #     self.permission_required = "view_ticket"
    #     HasRolePermission.has_permission(self, request, self.permission_required)

    #     print(f"Logged-in user: {request.user}")
    #     print(f"User ID: {request.user.id}")
    #     print(f"Query params: {request.query_params}")

    #     # If user is Admin
    #     if UserRole.objects.filter(user=request.user, role__name='Admin', is_active=True).exists():
    #         print("User is Admin")
    #         all_tickets = Ticket.objects.filter(is_active=True)
    #         paginator = LimitOffsetPagination()
    #         paginated_tickets = paginator.paginate_queryset(all_tickets, request, view=self)
    #         serializer = TicketSerializer(paginated_tickets, many=True)
    #         return paginator.get_paginated_response({
    #             "all_tickets": serializer.data
    #         })

    #     # If normal user
    #     print("User is Normal user (not Admin)")
    #     created_tickets = Ticket.objects.filter(created_by=request.user, is_active=True)
    #     assigned_tickets = Ticket.objects.filter(assignee=request.user, is_active=True).exclude(
    #         ticket_id__in=created_tickets.values_list('ticket_id', flat=True)
    #     )
    #     all_user_tickets = Ticket.objects.filter(
    #         Q(created_by=request.user) | Q(assignee=request.user),
    #         is_active=True
    #     ).distinct()

    #     # ).distinct()

    #     print(f"Created tickets count: {created_tickets.count()}")
    #     print(f"Assigned tickets count: {assigned_tickets.count()}")
    #     print(f"All user tickets count: {all_user_tickets.count()}")

    #     paginator = LimitOffsetPagination()

    #     if request.query_params.get('created') == 'True':
    #         paginated = paginator.paginate_queryset(created_tickets, request, view=self)
    #         serializer = TicketSerializer(paginated, many=True)
    #         return paginator.get_paginated_response({
    #             "all_tickets": serializer.data
    #         })

    #     if request.query_params.get('assignee') == 'True':
    #         paginated = paginator.paginate_queryset(assigned_tickets, request, view=self)
    #         serializer = TicketSerializer(paginated, many=True)
    #         return paginator.get_paginated_response({
    #             "all_tickets": serializer.data
    #         })

    #     # Otherwise show both created + assigned
    #     paginated = paginator.paginate_queryset(all_user_tickets, request, view=self)
    #     serializer = TicketSerializer(paginated, many=True)
    #     return paginator.get_paginated_response({
    #         "all_tickets": serializer.data
    #     })


class DashboardTicketAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        # User organization setup
        org = request.user.organisation
        self.permission_required = "view_sla"
        HasRolePermission.has_permission(self, request, self.permission_required)
        
        """get method to get all SLA timer objects"""
        all_tickets = Ticket.objects.filter(is_active=True, developer_organization=org)
        serializer = TicketSerializer(all_tickets, many=True)
        final_data = serializer.data
        
        # Process each ticket to calculate pause times
        for i in range(len(final_data)):
            ticket = final_data[i]['ticket_id']
            sla_timer = SLATimer.objects.filter(ticket=ticket).first()
            
            if not sla_timer:
                # Instead of returning error immediately, set a default value and continue
                final_data[i]['total_paused_time'] = "0:00:00"
                continue
                
            pause_times = [p for p in sla_timer.get_all_paused_times() if p]
            resume_times = [r for r in sla_timer.get_all_resumed_times() if r]
            
            total_paused_time = timedelta()
            used_resumes = set()
            
            for pause in pause_times:
                matching_resume = None
                for resume in resume_times:
                    if resume > pause and resume not in used_resumes:
                        matching_resume = resume
                        used_resumes.add(resume)
                        break
                        
                if matching_resume:
                    total_paused_time += (matching_resume - pause)
                else:
                    # Still paused (no resume yet)
                    current_time = datetime.utcnow().replace(tzinfo=pause.tzinfo)
                    total_paused_time += (current_time - pause)
                    
            final_data[i]['total_paused_time'] = str(total_paused_time)
        
        # Calculate totals and averages
        valid_tickets = 0
        total_solve_time = timedelta()
        total_paused_time = timedelta()
        
        for ticket in final_data:
            try:
                created = datetime.fromisoformat(ticket["created_at"])
                modified = datetime.fromisoformat(ticket["modified_at"])
                
                # Parse the paused time string safely
                paused_parts = ticket["total_paused_time"].split(":")
                if len(paused_parts) >= 3:
                    # Handle potential day information in timedelta string
                    if " " in paused_parts[0]:
                        days_str, hours_str = paused_parts[0].split(" ", 1)
                        days = int(days_str.replace("days,", "").replace("day,", ""))
                        hours = int(hours_str)
                    else:
                        days = 0
                        hours = int(paused_parts[0])
                    
                    minutes = int(paused_parts[1])
                    # Handle potential fractional seconds
                    seconds_str = paused_parts[2].split(".", 1)[0]
                    seconds = int(seconds_str)
                    
                    paused = timedelta(
                        days=days,
                        hours=hours,
                        minutes=minutes,
                        seconds=seconds
                    )
                    
                    solve_time = modified - created
                    resume_time = solve_time - paused
                    
                    total_solve_time += solve_time
                    total_paused_time += paused
                    valid_tickets += 1
            except (ValueError, IndexError, KeyError) as e:
                # Skip this ticket if there's an error parsing the time values
                print(f"Error processing ticket: {e}")
                continue
        
        # Prevent division by zero
        if valid_tickets > 0:
            avg_solve_time = total_solve_time / valid_tickets
            avg_paused_time = total_paused_time / valid_tickets
            avg_resume_time = avg_solve_time - avg_paused_time
        else:
            avg_solve_time = timedelta()
            avg_paused_time = timedelta()
            avg_resume_time = timedelta()
        
        return Response({
            "avg_solve_time": format_timedelta(avg_solve_time),
            "avg_paused_time": format_timedelta(avg_paused_time),
            "avg_resume_time": format_timedelta(avg_resume_time),
            "processed_tickets": valid_tickets,
            "total_tickets": len(final_data)
        }, status=status.HTTP_200_OK)
def format_timedelta(td):
    total_seconds = int(td.total_seconds())
    hours = total_seconds // 3600
    minutes = (total_seconds % 3600) // 60
    seconds = total_seconds % 60
    return f"{hours}:{minutes}:{seconds}"




class dispatcherAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self,request):
        self.permission_required = "view_ticket"
        HasRolePermission.has_permission(self, request, self.permission_required)

        print(f"Logged-in user: {request.user}")
        print(f"User ID: {request.user.id}")
        print(request.query_params.get)
        # role__name='Admin'
        if UserRole.objects.filter(user=request.user,).exists():
            all_tickets = Ticket.objects.filter(is_active= False)
            paginator = LimitOffsetPagination()
            paginated = paginator.paginate_queryset(all_tickets, request, view=self)
            serializer = TicketSerializer(paginated, many=True)
            return paginator.get_paginated_response({
                "all_tickets": serializer.data
            })
        return Response({"No tickets"}, status=status.HTTP_400_BAD_REQUEST)
    def put(self, request, *args, **kwargs):
        self.permission_required = "create_ticket"
        
        # if not HasRolePermission.has_permission(self, request, self.permission_required):
        #     return Response({"error": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        ticket_id = request.data.get("ticket_id")
        if not ticket_id:
            return Response({"error": "Ticket ID is required for update."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            ticket = Ticket.objects.get(ticket_id=ticket_id)
        except Ticket.DoesNotExist:
            return Response({"error": "Ticket not found."}, status=status.HTTP_404_NOT_FOUND)

        data = request.data.copy()
        print(data)

        serializer = TicketSerializer(ticket, data=data, partial=True)
        data['assignee']=serializer.validate_assignee(data['assignee'])
        
        print("********")
        print("********")
        if data['developer_organization']:
            data['developer_organization']=serializer.validate_developer_organization(data['developer_organization'])
            data['solution_grp']=serializer.validate_solution_grp(data['solution_grp'])
      
        if serializer.is_valid():
            
            updated_ticket = serializer.save(modified_by=request.user)
            
           

            return Response({
                "message": "Ticket updated successfully",
                "ticket_id": updated_ticket.ticket_id
            }, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

  
            
class TotalTicketsAPIViewCount(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        total_tickets = Ticket.objects.count()

        open_tickets = Ticket.objects.filter(status='open').count()
        inprogress_tickets = Ticket.objects.filter(status='Working in Progress').count()
        resolved_tickets = Ticket.objects.filter(status='Resolved').count()
        critical_tickets = Ticket.objects.filter(impact='A').count()
        medium_impact_tickets = Ticket.objects.filter(impact='B').count()
        low_impact_tickets = Ticket.objects.filter(impact='C').count()
        

        ticket_counts = {
            "total_tickets": total_tickets,
            "open": open_tickets,
            "inprogress": inprogress_tickets,
            "resolved": resolved_tickets,
            "critical": critical_tickets,
            "medium": medium_impact_tickets,
            "low": low_impact_tickets,
            
        }

        return Response(ticket_counts, status=status.HTTP_200_OK)
    
class AllTicketsAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Get all tickets in the system
        tickets = Ticket.objects.all()
        
        # Initialize pagination (you can adjust this as needed)
        paginator = LimitOffsetPagination()
        paginated_tickets = paginator.paginate_queryset(tickets, request, view=self)
        
        # Serialize the tickets
        serializer =TicketSerializer(paginated_tickets, many=True)
        
        # Return the paginated response
        return paginator.get_paginated_response(serializer.data)
    
class TicketByStatusAPIView(APIView):
    def get(self, request):
        status_param = request.query_params.get('status')
        if not status_param:
            return Response({'error': 'Status is required as a query param'}, status=status.HTTP_400_BAD_REQUEST)
        
        tickets = Ticket.objects.filter(status=status_param)
        serializer = TicketSerializer(tickets, many=True)
        return Response(serializer.data, status=status.HTTP_400_BAD_REQUEST)


"Assigning ticket to developer"
class AssignTicketAPIView(APIView):
    permission_classes = [IsADirectoryError]
    authentication_classes = [JWTAuthentication]

    def put(self, request, ticket_id):
        self.permission_required = "update_ticket"  
        HasRolePermission.has_permission(self,request,self.permission_required)
        try:
            ticket = get_object_or_404(Ticket, ticket_id=ticket_id)
            engineer_id = request.data.get("assignee")
            if not engineer_id:
                return Response(
                    {"error": "assignee field is required."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Validate if the engineer (user) exists
            engineer = User.objects.filter(id=engineer_id).first() 
            if not engineer:
                return Response(
                    {"error": "The specified engineer does not exist."},
                    status=status.HTTP_404_NOT_FOUND,
                )
 
            # Proceed with the ticket assignment
            serializer = AssignTicketSerializer(ticket, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()

                # Send email via Celery
                if engineer.email:
                    send_assignment_email.delay(
                        engineer_username=engineer.username,
                        engineer_email=engineer.email,
                        ticket_summary=ticket.summary,
                        ticket_description=ticket.description,
                    )
                data ={"title":f"Assigneed ticket to {engineer.username}", "ticket":ticket,"created_by":request.user}
                serializer_history = TicketHistorySerializer(data=data)
                if serializer_history.is_valid():
                    serializer_history.save(modified_by=request.user)
                return Response(
                    {
                        "message": "Ticket assigned successfully.",
                        "engineer_username": engineer.username,
                    },
                    status=status.HTTP_200_OK,
                )

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except APIException as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response(
                {"error": f"An unexpected error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class TicketDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
  
    """Handles GET, PUT, DELETE for a single ticket"""
    def get(self, request, ticket_id):
        """GET method to retrieve a ticket object by string ID"""
        ticket = self.get_object(ticket_id)
        if not ticket:
            return Response({"error": "Ticket not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = TicketSerializer(ticket)
        return Response(serializer.data)

    def get_object(self, ticket_id):
        try:
            return Ticket.objects.get(ticket_id=ticket_id)  # assuming ticket_id is a field in your model
        except Ticket.DoesNotExist:
            return None
        
        
        
        
    def put(self, request, ticket_id):
        """put method to update the ticket object"""
        ticket = self.get_object(ticket_id)
        print(request.data)
        if not ticket:
            return Response({"error": "Ticket not found"}, status=status.HTTP_404_NOT_FOUND)
        datas = request.data.copy()
        serializer = TicketSerializer(data=datas,partial = True)
        try:
            datas['assignee']=serializer.validate_assignee(datas['assignee'])
            datas['developer_organization']=serializer.validate_developer_organization(datas['developer_organization'])
            datas['solution_grp']=serializer.validate_solution_grp(datas['solution_grp'])
        except:
            print("excepted")
        
        serializer = TicketSerializer(ticket, data=datas, partial=True)
        if serializer.is_valid():
            serializer.save()
            if ticket.created_by and ticket.created_by.email:
                send_status_change_email_async.delay(ticket.ticket_id, ticket.status, ticket.created_by.email)
            if ticket.assignee and ticket.assignee.email:
                send_status_change_email_async.delay(ticket.ticket_id, ticket.status, ticket.assignee.email)
            data ={"title":f"{request.user.username} changed status to {request.data['status']}.", "ticket":ticket_id,"created_by":request.user}
            serializer_history = TicketHistorySerializer(data=data)
            if serializer_history.is_valid():
                serializer_history.save(modified_by=request.user)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def delete(self, ticket_id):
        """delete method to delete the ticket object"""
        ticket = self.get_object(ticket_id)
        if not ticket:
            return Response({"error": "Ticket not found"}, status=status.HTTP_404_NOT_FOUND)
        ticket.delete()
        return Response({"message": "Ticket deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
    
"API for dropdown "
class TicketChoicesAPIView(APIView):
    def get(self, request):
        choices = {
            "status_choices": Ticket.STATUS_CHOICES,
            # "issue_type_choices": Ticket.ISSUE_TYPE,
            "support_team_choices": Ticket.SUPPORT,
            # "contact_mode_choices": Ticket._meta.get_field("contact_mode").choices
            "impact_choices":Ticket.IMPACT, #change 1
        
        }
        return Response(choices)
    


class CloseTicketAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    @transaction.atomic
    def post(self, request, ticket_id):
        # self.required_permission = "delete_ticket"  
        # self.check_permissions(request) 
        ticket = get_object_or_404(Ticket, ticket_id=ticket_id)
        
        if ticket.customer != request.user:
            return Response({"message": "You are not authorized to close this ticket."}, status=status.HTTP_403_FORBIDDEN)

        ticket.is_resolved = True
        ticket.status = 'Resolved'
        ticket.save()

        # Stop SLA timer when the ticket is closed
        ticket.sla_timer.stop_sla()
        data ={"title":f"{request.user.username} closed ticket", "ticket":ticket,"created_by":request.user}
        serializer_history = TicketHistorySerializer(data=data)
        if serializer_history.is_valid():
            serializer_history.save(modified_by=request.user)

        return Response({"message": "Ticket has been closed."}, status=status.HTTP_200_OK)
    

class SLATimerAPIView(APIView):
    """Handles GET and POST for SLA timers"""
    def get(self,request):
        self.permission_required = "view_sla"  
        HasRolePermission.has_permission(self,request,self.permission_required)
        """get method to get all SLA timer objects"""
        sla_timers = SLATimer.objects.all()
        serializer = SLATimerSerializer(sla_timers, many=True)
        final_data=serializer.data
        
        for i  in range(len(serializer.data)):
            ticket = serializer.data[i]['ticket']
            sla_timer = SLATimer.objects.filter(ticket=ticket).first()  
            if not sla_timer:
                return Response({"error": "SLA Timer not found"}, status=status.HTTP_404_NOT_FOUND)

            pause_times = sla_timer.get_all_paused_times()
            resume_times = sla_timer.get_all_resumed_times()

            pause_times = [p for p in sla_timer.get_all_paused_times() if p]
            resume_times = [r for r in sla_timer.get_all_resumed_times() if r]

            total_paused_time = timedelta()
            used_resumes = set()

            for pause in pause_times:
                matching_resume = None
                for resume in resume_times:
                    if resume > pause and resume not in used_resumes:
                        matching_resume = resume
                        used_resumes.add(resume)
                        break
                
                if matching_resume:
                    total_paused_time += (matching_resume - pause)
                else:
                    # Still paused (no resume yet)
                    current_time = datetime.utcnow().replace(tzinfo=pause.tzinfo)
                    total_paused_time += (current_time - pause)
            final_data[i]['total_paused_time']=str(total_paused_time)
            
            
        
        
        return Response(serializer.data)
    def post(self, request):
        """post method to create a new SLA timer object"""
        serializer = SLATimerSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class SLATimerDetailAPIView(APIView):
    # """Handles GET, PUT, DELETE for a single SLA timer"""
    # def get_object(self, ticket_id):
    #     "get method to get the SLA timer object"
    #     try:
    #         return SLATimer.objects.get(ticket__ticket_id=ticket_id)
    #     except SLATimer.DoesNotExist:
    #         return None
    # def get(self, request, ticket_id, *args, **kwargs):
    #     """get method to get the SLA timer object"""
    #     sla_timer = SLATimer.objects.get(id=ticket_id)
    #     if not sla_timer:
    #         return Response({"error": "SLA Timer not found"}, status=status.HTTP_404_NOT_FOUND)
    #     serializer = SLATimerSerializer(sla_timer)
    #     return Response(serializer.data)

    def get(self, request, *args, **kwargs):
        ticket_id = kwargs.get("ticket_id")  # ✅ Ensure we get ticket_id
        if not ticket_id:
            return Response({"error": "ticket_id is required"}, status=400)

        try:
            sla_timer = SLATimer.objects.get(ticket_id=ticket_id)  # ✅ Correct field name
            # return Response({"sla_due_date": sla_timer.sla_due_date})
            final_data = SLATimerSerializer(sla_timer).data
        

     
            sla_timer = SLATimer.objects.filter(ticket=ticket_id).first()  
            if not sla_timer:
                return Response({"error": "SLA Timer not found"}, status=status.HTTP_404_NOT_FOUND)

            pause_times = sla_timer.get_all_paused_times()
            resume_times = sla_timer.get_all_resumed_times()

            pause_times = [p for p in sla_timer.get_all_paused_times() if p]
            resume_times = [r for r in sla_timer.get_all_resumed_times() if r]

            total_paused_time = timedelta()
            used_resumes = set()

            for pause in pause_times:
                matching_resume = None
                for resume in resume_times:
                    if resume > pause and resume not in used_resumes:
                        matching_resume = resume
                        used_resumes.add(resume)
                        break
                
                if matching_resume:
                    total_paused_time += (matching_resume - pause)
                else:
                    # Still paused (no resume yet)
                    current_time = datetime.utcnow().replace(tzinfo=pause.tzinfo)
                    total_paused_time += (current_time - pause)
            final_data['total_paused_time']=str(total_paused_time)
            
            return Response(final_data)
        except SLATimer.DoesNotExist:
            return Response({"error": "SLA Timer not found"}, status=404)

    
    # def get(self, request, *args, **kwargs):
    #     ticket_id = kwargs.get("ticket_id")  # ✅ Extract ticket_id from kwargs
    #     if not ticket_id:
    #         return Response({"error": "ticket_id is required"}, status=400)
        
    #     sla_timer = SLATimer.objects.get(id=ticket_id)
    #     return Response({"id": sla_timer.id})

    def put(self, request, ticket_id):
        """put method to update the SLA timer object"""
        sla_timer = self.get_object(ticket_id)
        if not sla_timer:
            return Response({"error": "SLA Timer not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = SLATimerSerializer(sla_timer, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def delete(self,request, ticket_id):
        """delete method to delete the SLA timer object"""
        sla_timer = self.get_object(ticket_id)
        if not sla_timer:
            return Response({"error": "SLA Timer not found"}, status=status.HTTP_404_NOT_FOUND)
        sla_timer.delete()
        data ={"title":f"{request.user.username} deleted ticket", "ticket":ticket_id,"created_by":request.user}
        serializer_history = TicketHistorySerializer(data=data)
        if serializer_history.is_valid():
            serializer_history.save(modified_by=request.user)
        return Response({"message": "SLA Timer deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
    



class SLABreachStatusAPIView(APIView):
    def get(self, request, ticket_id):
        try:
            sla_timer = SLATimer.objects.get(ticket__ticket_id=ticket_id)
            breached = sla_timer.check_sla_breach()
            data ={"title":f"Ticket has breached", "ticket":ticket_id,"created_by":request.user}
            serializer_history = TicketHistorySerializer(data=data)
            if serializer_history.is_valid():
                serializer_history.save(modified_by=request.user)
            return Response({
                "ticket_id": ticket_id,
                "sla_breached": breached,
                "sla_due_date": sla_timer.sla_due_date,
                "sla_status": sla_timer.sla_status
            })
        except SLATimer.DoesNotExist:
            return Response({"error": "SLA Timer not found"}, status=status.HTTP_404_NOT_FOUND)




# class SLAActionAPIView(APIView):
#     """Handles SLA timer actions (start, pause, resume)"""
#     action = None
#     def post(self, request,ticket_id, *args, **kwargs):
#         """post method to start, pause or resume the SLA timer"""
#         ticket = Ticket.objects.filter(ticket_id=ticket_id).first()
#         if not ticket:
#             return Response({"error": "Ticket not found"}, status=status.HTTP_404_NOT_FOUND)
#         if self.action == "start":
#             # SLAService.start_sla(ticket)
#             return Response({"message": "SLA timer started"}, status=status.HTTP_200_OK)
#         if self.action == "pause":
#             # SLAService.pause_sla(ticket)
#             return Response({"message": "SLA timer paused"}, status=status.HTTP_200_OK)
#         elif self.action == "resume":
#             # SLAService.resume_sla(ticket)
#             return Response({"message": "SLA timer resumed"}, status=status.HTTP_200_OK)
#         return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)
    
#     def get(self, request, ticket_id, *args, **kwargs):
#         try:
#             ticket = Ticket.objects.get(ticket_id=ticket_id) 
#         except Ticket.DoesNotExist:
#             return Response({"error": "Ticket not found"}, status=status.HTTP_404_NOT_FOUND)

#         sla_timer = SLATimer.objects.filter(ticket=ticket).first()  
#         if not sla_timer:
#             return Response({"error": "SLA Timer not found"}, status=status.HTTP_404_NOT_FOUND)

#         pause_times = sla_timer.get_all_paused_times()  
#         resume_times = sla_timer.get_all_resumed_times() 
#         total_paused_time = timedelta()

#         for pause, resume in zip(pause_times, resume_times):
#             total_paused_time += (resume - pause) 
#         if resume_times and pause_times and pause_times[-1] > resume_times[-1]:
#             current_time = datetime.utcnow().replace(tzinfo=pause_times[0].tzinfo)  # Ensure same timezone
#             total_paused_time += (current_time - pause_times[-1])

            
#         data = {
#             "ticket_id": ticket.ticket_id,
#             "start_time": sla_timer.start_time,
#             "end_time": sla_timer.end_time,
#             "total_paused_time": str(total_paused_time), 
#             "sla_due_date": sla_timer.sla_due_date,
            # "breached": sla_timer.breached,
        # }
