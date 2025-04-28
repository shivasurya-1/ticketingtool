from django.urls import path
from .views import GetAssignee,dispatcherAPIView, DashboardTicketAPIView,TicketAPI_Delegated, CreateTicketAPIView,TicketAPIID, TicketDetailAPIView, SLATimerAPIView, SLATimerDetailAPIView,ReferenceTicketAPILIST,AssignTicketAPIView,TicketChoicesAPIView,ListTicketAPIView,TicketByStatusAPIView,TotalTicketsAPIViewCount,SLABreachStatusAPIView

urlpatterns = [

    #Ticketslist
    path('list/', ReferenceTicketAPILIST.as_view(), name='list'),
    path('org_assignee/', GetAssignee.as_view(), name='get_assignee'),#for assignee
    # get ticket id
    path('getId/', TicketAPIID.as_view(), name='getId'),
    # Ticket Endpoints
    path('create/', CreateTicketAPIView.as_view(), name='tickets'),
    path('all/', ListTicketAPIView.as_view(), name='customer_tickets'),
    path('timefield/', DashboardTicketAPIView.as_view(), name='timefield'),
    path('dispatcher/', dispatcherAPIView.as_view(), name='dispatcher'),
    path('tickets/total/count', TotalTicketsAPIViewCount.as_view(), name='total_tickets'), #for count
    path('assign-ticket/<str:ticket_id>/', AssignTicketAPIView.as_view(), name='assign-ticket'),
    path('ticket/choices/', TicketChoicesAPIView.as_view(), name='ticket-choices'),
    # path('tickets/<str:ticket_id>/', TicketDetailAPIView.as_view(), name='ticket_detail'),
    path('tickets/<str:ticket_id>/', TicketDetailAPIView.as_view(), name='ticket_detail'),
    path('tickets/by-status/', TicketByStatusAPIView.as_view(), name='tickets-by-status'),
    # urls.py
    path('sla/<str:ticket_id>/check-breach/', SLABreachStatusAPIView.as_view(), name='check-sla-breach'),

    # SLA Timer Endpoints
    path('sla-timers/', SLATimerAPIView.as_view(), name='sla_timers'),
    path('sla-timers/<str:ticket_id>/', SLATimerDetailAPIView.as_view(), name='sla_timer_detail'),

    path('delegate/',TicketAPI_Delegated.as_view(),name ='delegate'),
    # SLA Timer Actions
    # path('sla/start/<uuid:ticket_id>/', SLAActionAPIView.as_view(action='start'), name='sla_start'),
    # path('sla/pause/<uuid:ticket_id>/', SLAActionAPIView.as_view(action='pause'), name='sla_pause'),
    # path('sla/resume/<uuid:ticket_id>/', SLAActionAPIView.as_view(action='resume'), name='sla_resume'),
    # path('sla-timers/<uuid:ticket_id>/', SLATimerDetailAPIView.as_view(), name='sla-timer-detail'),

]
