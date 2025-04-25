
from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.utils.translation import gettext as _
# from .models import Ticket
from django.apps import apps 


# @shared_task
# def send_ticket_creation_email(ticket_id, engineer_email,requester_email):
#     try:
#         Ticket = apps.get_model('timer', 'Ticket')  # 🔁 Replace with your actual app name
#     except LookupError:
#         raise Exception("App with label 'timer' not found.")

#     try:
#         ticket = Ticket.objects.get(ticket_id=ticket_id)
#     except Ticket.DoesNotExist:
#         raise Exception(f"Ticket with ID {ticket_id} not found.")

#     subject = f"New Ticket Created: {ticket.ticket_id}"

#     body = (
#         f"Ticket Summary: {ticket.summary}\n"
#         f"Description: {ticket.description}\n\n"
#         f"Please log in to the system to view the ticket.\n\n"
#         f"Thank you."
#     )

#     # 🧑‍💻 Email to Engineer (Assignee)
#     if engineer_email:
#         engineer_msg = (
#             "A new ticket has been assigned to you.\n\n" + body
#         )
#         send_mail(
#             subject,
#             engineer_msg,
#             settings.EMAIL_HOST_USER,
#             [engineer_email],
#             fail_silently=False
#         )

#     # 🏢 Email to Organization
#     if ticket.developer_organization and hasattr(ticket.developer_organization, 'email') and ticket.developer_organization.email:
#         org_msg = (
#             "A new ticket has been assigned to your organization.\n\n" + body
#         )
#         send_mail(
#             subject,
#             org_msg,
#             settings.EMAIL_HOST_USER,
#             [ticket.developer_organization.email],
#             fail_silently=False
#         )

#     # 🙋 Email to Requester
#     if requester_email:
#         requester_msg = (
#             f"Your ticket has been successfully created with ID: {ticket.ticket_id}\n\n" + body
#         )
#         send_mail(
#             f"Ticket Created: {ticket.ticket_id}",
#             requester_msg,
#             settings.EMAIL_HOST_USER,
#             [requester_email],
#             fail_silently=False
#         )

# timer/tasks.py

# from celery import shared_task
# from django.apps import apps
# from django.core.mail import send_mail
# from django.conf import settings

# @shared_task
# def send_ticket_creation_email(ticket_id, engineer_email, requester_email):
#     try:
#         Ticket = apps.get_model('timer', 'Ticket')
#     except LookupError:
#         raise Exception("App with label 'timer' not found.")

#     try:
#         ticket = Ticket.objects.get(ticket_id=ticket_id)
#     except Ticket.DoesNotExist:
#         raise Exception(f"Ticket with ID {ticket_id} not found.")

#     subject = f"New Ticket Created: {ticket.ticket_id}"

#     body = (
#         f"Ticket Summary: {ticket.summary}\n"
#         f"Description: {ticket.description}\n\n"
#         f"Please log in to the system to view the ticket.\n\n"
#         f"Thank you."
#     )

#     # 👨‍💻 Email to Engineer
#     if engineer_email:
#         engineer_msg = (
#             "A new ticket has been assigned to you.\n\n" + body
#         )
#         send_mail(
#             subject,
#             engineer_msg,
#             settings.EMAIL_HOST_USER,
#             [engineer_email],
#             fail_silently=False
#         )

#     # 🏢 Email to Developer Organization
#     if ticket.developer_organization and hasattr(ticket.developer_organization, 'email') and ticket.developer_organization.email:
#         org_msg = (
#             "A new ticket has been assigned to your organization.\n\n" + body
#         )
#         send_mail(
#             subject,
#             org_msg,
#             settings.EMAIL_HOST_USER,
#             [ticket.developer_organization.email],
#             fail_silently=False
#         )

#     # 🙋 Email to Requester
#     if requester_email:
#         requester_msg = (
#             f"Your ticket has been successfully created with ID: {ticket.ticket_id}\n\n" + body
#         )
#         send_mail(
#             f"Ticket Created: {ticket.ticket_id}",
#             requester_msg,
#             settings.EMAIL_HOST_USER,
#             [requester_email],
#             fail_silently=False
#         )

from celery import shared_task
from django.apps import apps
from django.core.mail import send_mail
from django.conf import settings

@shared_task
def send_ticket_creation_email(ticket_id, engineer_email, requester_email):
    try:
        Ticket = apps.get_model('timer', 'Ticket')
    except LookupError:
        raise Exception("App with label 'timer' not found.")

    try:
        ticket = Ticket.objects.select_related('developer_organization').get(ticket_id=ticket_id)
    except Ticket.DoesNotExist:
        raise Exception(f"Ticket with ID {ticket_id} not found.")

    subject = f"New Ticket Created: {ticket.ticket_id}"

    body = (
        f"Ticket Summary: {ticket.summary}\n"
        f"Description: {ticket.description}\n\n"
        f"Please log in to the system to view the ticket.\n\n"
        f"Thank you."
    )

    # 👨‍💻 Email to Engineer
    if engineer_email:
        engineer_msg = "A new ticket has been assigned to you.\n\n" + body
        send_mail(
            subject,
            engineer_msg,
            settings.EMAIL_HOST_USER,
            [engineer_email],
            fail_silently=False
        )

    # 🏢 Email to Developer Organization
    developer_org = ticket.developer_organization
    if developer_org and getattr(developer_org, 'email', None):
        org_msg = "A new ticket has been assigned to your organization.\n\n" + body
        send_mail(
            subject,
            org_msg,
            settings.EMAIL_HOST_USER,
            [developer_org.email],
            fail_silently=False
        )
    else:
        print(f"No valid email found for developer organization of ticket {ticket.ticket_id}")

    # 🙋 Email to Requester
    if requester_email:
        requester_msg = (
            f"Your ticket has been successfully created with ID: {ticket.ticket_id}\n\n" + body
        )
        send_mail(
            f"Ticket Created: {ticket.ticket_id}",
            requester_msg,
            settings.EMAIL_HOST_USER,
            [requester_email],
            fail_silently=False
        )

 
  

## sending Email to the developer after the ticket is assigned to the engineer
@shared_task
def send_assignment_email(engineer_username, engineer_email, ticket_summary, ticket_description):
    """
    Celery task to send an email notification when a ticket is assigned to an engineer. 
    """
    subject = f"New Ticket Assigned: {ticket_summary}"
    message = (
        f"Hello {engineer_username},\n\n"
         
        f"A new ticket has been assigned to you.\n\n"
        f"Ticket Summary: {ticket_summary}\n"
        f"Description: {ticket_description}\n\n"
        f"Please log in to the system to review the ticket.\n\n"
        f"Thank you."
    )
    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[engineer_email],
        fail_silently=False,
    )





# from celery import shared_task
# from django.utils.timezone import now
# from .models import SLATimer, SlaTimeHist

# @shared_task
# def check_sla_breach():
#     sla_timers = SLATimer.objects.filter(breached=False)
#     for sla in sla_timers:
#         if sla.get_sla_due_date() and now() > sla.get_sla_due_date():
#             sla.breached = True
#             sla.save()
#             SlaTimeHistory.objects.create(ticket=sla.ticket, sla_status="Breached", changed_by=sla.ticket.modified_by)


# ## sending Email to the developer after the ticket status is changed
# @shared_task  
# def send_status_change_email_async(ticket_id, new_status, recipient_email):
#     try:
#         from timer.models import Ticket  # Lazy import here
#         ticket = Ticket.objects.get(ticket_id=ticket_id)
#         subject = f"Ticket {ticket.ticket_id} Status Updated: {new_status}"
 
#         message = (
#             f"Hello,\n\n"
#             f"The status of your ticket ({ticket.ticket_id}) has been updated.\n"
#             f"Description: {ticket.description}\n"
#             f"New Status: {new_status}\n"
#             f"Created By: {ticket.created_by.get_full_name() if ticket.created_by else 'Unknown'}\n"
#             f"Assigned Engineer: {ticket.engineer.get_full_name() if ticket.engineer else 'Unassigned'}\n\n"
#             f"Thank you,\nSupport Team"
#         )
 
       
#         send_mail(
#             subject,
#             message,
#             settings.DEFAULT_FROM_EMAIL,
#             [recipient_email],  # Send to individual email
#             fail_silently=False,
#         )
 
#         return f"Email sent successfully to {recipient_email} for ticket {ticket.ticket_id}."
   
#     except Ticket.DoesNotExist:
#         return f"Ticket with ID {ticket_id} not found."
#     except Exception as e:
#         return f"Error sending email: {str(e)}"


@shared_task
def send_status_change_email_async(ticket_id, new_status, recipient_email):
    try:
        from timer.models import Ticket
 
        ticket = Ticket.objects.get(ticket_id=ticket_id)
 
        # Created by user
        if ticket.created_by:
            created_by_name = (
               
                ticket.created_by.get_full_name().strip()
                if hasattr(ticket.created_by, "get_full_name") and ticket.created_by.get_full_name()
                else ticket.created_by.username
            )
 
        else:
            created_by_name = "Unknown"
 
        # Get assignee name
        if ticket.assignee:
            engineer_name = (
                ticket.assignee.get_full_name().strip()
                if hasattr(ticket.assignee, "get_full_name") and ticket.assignee.get_full_name()
                else ticket.assignee.username
            )
 
        else:
            engineer_name = "Unassigned"
 
 
        subject = f"Ticket {ticket.ticket_id} Status Updated: {new_status}"
 
        message = (
            f"Hello,\n\n"
            f"The status of your ticket ({ticket.ticket_id}) has been updated.\n"
            f"Description: {ticket.description}\n"
            f"New Status: {new_status}\n"
            f"Created By: {created_by_name}\n"
            f"Assigned Engineer: {engineer_name}\n\n"
            f"Thank you,\nSupport Team"
        )
 
 
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [recipient_email],
            fail_silently=False,
        )
 
        return f"Email sent successfully to {recipient_email} for ticket {ticket.ticket_id}."
 
    except Ticket.DoesNotExist:
        return f"Ticket with ID {ticket_id} not found."
    except Exception as e:
        return f"Error sending email: {str(e)}"
# Add these to your tasks.py file
   
 
 
# # Add these to your tasks.py file
 
# @shared_task
# def send_sla_warning_notification(ticket_id, recipient_email, due_date):
#     """
#     Send a notification when an SLA is about to breach
#     """
#     subject = f"⚠️ SLA Warning for Ticket {ticket_id}"
   
#     # Convert due_date to string if it's a datetime object
#     if not isinstance(due_date, str):
#         due_date = due_date.strftime("%Y-%m-%d %H:%M:%S")
   
#     message = f"""
#     SLA Warning Alert:
   
#     The Service Level Agreement (SLA) for ticket {ticket_id} is approaching its deadline.
   
#     SLA Due Date: {due_date}
   
#     Please address this ticket promptly to avoid an SLA breach.
   
#     This is an automated message.
#     """
   
#     from_email = settings.DEFAULT_FROM_EMAIL
#     recipient_list = [recipient_email]
   
#     send_mail(subject, message, from_email, recipient_list)
   
#     return f"SLA warning notification sent to {recipient_email} for ticket {ticket_id}"
 
# @shared_task
# def send_sla_breach_notification(ticket_id, recipient_email):
#     """
#     Send a notification when an SLA has been breached
#     """
#     subject = f"🚨 SLA BREACHED for Ticket {ticket_id}"
   
#     message = f"""
#     URGENT: SLA Breach Alert:
   
#     The Service Level Agreement (SLA) for ticket {ticket_id} has been BREACHED.
   
#     This ticket requires immediate attention and resolution.
   
#     This is an automated message.
#     """
   
#     from_email = settings.DEFAULT_FROM_EMAIL
#     recipient_list = [recipient_email]
   
#     send_mail(subject, message, from_email, recipient_list)
   
#     return f"SLA breach notification sent to {recipient_email} for ticket {ticket_id}"
 
# @shared_task
# def check_all_sla_timers():
#     """
#     Periodic task to check all active SLA timers for breaches
#     """
#     from .models import SLATimer
   
#     # Get all active SLA timers
#     active_timers = SLATimer.objects.filter(sla_status='Active')
   
#     breach_count = 0
#     warning_count = 0
   
#     for timer in active_timers:
#         # Check for breach
#         if timer.check_sla_breach():
#             breach_count += 1
   
#     return f"SLA check completed. Found {breach_count} breaches and sent {warning_count} warnings."
 

from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import timedelta

@shared_task
def send_sla_warning_notification(ticket_id, recipient_email, due_date):
    """
    Send a notification when an SLA is about to breach
    """
    subject = f"⚠️ SLA Warning for Ticket {ticket_id}"

    if not isinstance(due_date, str):
        due_date = due_date.strftime("%Y-%m-%d %H:%M:%S")

    message = f"""
    SLA Warning Alert:

    The Service Level Agreement (SLA) for ticket {ticket_id} is approaching its deadline.

    SLA Due Date: {due_date}

    Please address this ticket promptly to avoid an SLA breach.

    This is an automated message.
    """

    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [recipient_email])

    return f"SLA warning notification sent to {recipient_email} for ticket {ticket_id}"


@shared_task
def send_sla_breach_notification(ticket_id, recipient_email):
    """
    Send a notification when an SLA has been breached
    """
    subject = f"🚨 SLA BREACHED for Ticket {ticket_id}"

    message = f"""
    URGENT: SLA Breach Alert:

    The Service Level Agreement (SLA) for ticket {ticket_id} has been BREACHED.

    This ticket requires immediate attention and resolution.

    This is an automated message.
    """

    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [recipient_email])

    return f"SLA breach notification sent to {recipient_email} for ticket {ticket_id}"


@shared_task
def check_all_sla_timers():
    """
    Periodic task to check all active SLA timers for warnings and breaches
    """
    from .models import SLATimer

    now = timezone.now()
    active_timers = SLATimer.objects.filter(sla_status='Active')

    breach_count = 0
    warning_count = 0

    for timer in active_timers:
        # Check breach
        if timer.check_sla_breach():
            breach_count += 1
            continue  # skip warning if already breached

        # Send warning 1 hour before due date
        time_to_due = timer.due_date - now
        if timedelta(minutes=0) < time_to_due <= timedelta(hours=1) and not timer.warning_sent:
            send_sla_warning_notification.delay(
                ticket_id=timer.ticket.ticket_id,
                recipient_email=timer.ticket.assigned_to.email,
                due_date=timer.due_date
            )
            timer.warning_sent = True
            timer.save(update_fields=['warning_sent'])
            warning_count += 1

    return f"SLA check completed. Found {breach_count} breaches and sent {warning_count} warnings."
