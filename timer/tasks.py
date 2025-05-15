from celery import shared_task
from django.core.mail import send_mail, EmailMessage
from django.conf import settings
from django.utils.translation import gettext as _
from django.apps import apps
from django.utils import timezone
from datetime import timedelta
from django.utils.html import strip_tags
import os
from .models import Ticket, Attachment, SLATimer
from django.core.mail import send_mail, EmailMultiAlternatives
from django.utils.html import strip_tags
from datetime import datetime
from django.template.loader import render_to_string
from celery import shared_task
from django.urls import reverse
 


# @shared_task
# def send_ticket_creation_email(ticket_id, engineer_email, requester_email, org_email):
#     """
#     Send notification emails when a new ticket is created.
#     """
#     try:
#         ticket = Ticket.objects.select_related('developer_organization').get(ticket_id=ticket_id)
#     except Ticket.DoesNotExist:
#         raise Exception(f"Ticket with ID {ticket_id} not found.")

#     subject = f"New Ticket Created: {ticket.ticket_id}"

#     body = (
#         f"Ticket Summary: {ticket.summary}\n"
#         f"Description: {ticket.description}\n\n"
#         f"Please log in to the system to view the ticket.\n\n"
#         f"Thank you."
#     )

#     # Email to Engineer
#     if engineer_email:
#         engineer_msg = "A new ticket has been assigned to you.\n\n" + body
#         send_mail(
#             subject,
#             engineer_msg,
#             settings.EMAIL_HOST_USER,
#             [engineer_email],
#             fail_silently=False
#         )

#     # Email to Organization
#     if org_email:
#         org_msg = "A new ticket has been assigned to your organization.\n\n" + body
#         send_mail(
#             subject,
#             org_msg,
#             settings.EMAIL_HOST_USER,
#             [org_email],
#             fail_silently=False
#         )
#     else:
#         print(f"No valid email found for developer organization of ticket {ticket.ticket_id}")

#     # Email to Requester
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
@shared_task
def send_ticket_creation_email(ticket_id, engineer_email, requester_email, developer_org_email):
    try:
        Ticket = apps.get_model('timer', 'Ticket')
        Attachment = apps.get_model('timer', 'Attachment')
    except LookupError:
        raise Exception("Required model not found in 'timer' app.")
 
    try:
        ticket = Ticket.objects.select_related('developer_organization').get(ticket_id=ticket_id)
    except Ticket.DoesNotExist:
        raise Exception(f"Ticket with ID {ticket_id} not found.")
 
    ticket_url = f"{settings.SITE_URL}/tickets/{ticket.ticket_id}"
    from_email = settings.DEFAULT_FROM_EMAIL
    subject = f"🎫 New Ticket Created: {ticket.ticket_id}"
 
    plain_body = (
        f"Hello,\n\n"
        f"A new ticket has been created.\n\n"
        f"Ticket ID: {ticket.ticket_id}\n"
        f"Summary: {ticket.summary}\n"
        f"Description: {ticket.description}\n\n"
        f"Please log in to the system to view the ticket:\n{ticket_url}\n\n"
        f"Thank you,\nThe Support Team"
    )
 
    base_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Ticket Created</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
      <table align="center" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
        <tr>
          <td align="center" style="padding: 20px;">
            <div style="
                background-image: url('https://res.cloudinary.com/dxragmx2f/image/upload/v1746952549/NxTalk-02_bkbkpj.jpg');
                background-size: cover;
                background-repeat: no-repeat;
                background-position: center;
                width: 250px;
                height: 100px;
                margin: auto;
                display: block;
                border-radius: 8px;
                "></div>
          </td>
        </tr>
 
        <tr>
          <td style="padding: 20px; text-align: center;">
            <h3 style="color: green;">🎫 Ticket Successfully Created</h3>
            <table align="center" style="margin-top: 10px; font-size: 16px;">
              <tr>
                <td><strong>Ticket ID:</strong></td>
                <td style="padding-left: 10px;">{ticket.ticket_id}</td>
              </tr>
              <tr>
                <td><strong>Summary:</strong></td>
                <td style="padding-left: 10px;">{ticket.summary}</td>
              </tr>
              <tr>
                <td><strong>Description:</strong></td>
                <td style="padding-left: 10px;">{ticket.description}</td>
              </tr>
            </table>
            <br>
            <a href="{ticket_url}" target="_blank" style="
              background-color: #28a745;
              color: white;
              padding: 10px 20px;
              text-decoration: none;
              border-radius: 5px;
              display: inline-block;
            ">View Ticket</a>
            <br><br>
            <p style="color: #555;">Thank you for your attention.<br>The Support Team</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
    """
 
    def send_email_to(recipient, role):
        role_note = {
            'engineer': 'assigned to you',
            'developer_org': 'assigned to your organization',
            'requester': 'successfully created',
        }[role]
 
        personalized_plain = plain_body.replace("has been created", f"has been {role_note}")
        personalized_html = base_html.replace("Successfully Created", role_note.capitalize())
 
        msg = EmailMultiAlternatives(subject, personalized_plain, from_email, [recipient])
        msg.attach_alternative(personalized_html, "text/html")
 
        # Attach files
        for attachment in ticket.attachments.all():
            if attachment.file and os.path.isfile(attachment.file.path):
                msg.attach_file(attachment.file.path)
 
        msg.send(fail_silently=False)
 
    # Send to each recipient
    if ticket.assignee:
        send_email_to(ticket.assignee.email, 'engineer')
    if developer_org_email:
        send_email_to(developer_org_email, 'developer_org')
    if requester_email:
        send_email_to(requester_email, 'requester')
 

@shared_task
def send_assignment_email(engineer_username, engineer_email, ticket_summary, ticket_description):
    """
    Send an email notification when a ticket is assigned to an engineer.
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


@shared_task
def send_status_change_email_async(ticket_id, new_status, recipient_email):
    """
    Send an email notification when a ticket's status is changed.
    """
    try:
        ticket = Ticket.objects.get(ticket_id=ticket_id)

        created_by_name = (
            ticket.created_by.get_full_name().strip()
            if ticket.created_by and hasattr(ticket.created_by, "get_full_name") and ticket.created_by.get_full_name()
            else ticket.created_by.username if ticket.created_by else "Unknown"
        )

        engineer_name = (
            ticket.assignee.get_full_name().strip()
            if ticket.assignee and hasattr(ticket.assignee, "get_full_name") and ticket.assignee.get_full_name()
            else ticket.assignee.username if ticket.assignee else "Unassigned"
        )

        subject = f"Update on Ticket {ticket.ticket_id}: Status Changed to {new_status}"

        message = (
            f"Dear User,\n\n"
            f"We would like to inform you that the status of your support ticket has been updated.\n\n"
            f"📄 Ticket ID: {ticket.ticket_id}\n"
            f"📝 Description: {strip_tags(ticket.description).strip()}\n"
            f"🔄 New Status: {new_status}\n"
            f"👤 Created By: {created_by_name}\n"
            f"🛠️ Assigned Engineer: {engineer_name}\n\n"
            f"If you have any questions or require further assistance, please feel free to respond to this email.\n\n"
            f"Best regards,\n"
            f"Support Team"
        )

        email = EmailMessage(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [recipient_email],
        )

        # Attach any files associated with the ticket
        for attachment in ticket.attachments.all():
            if attachment.file and os.path.isfile(attachment.file.path):
                email.attach_file(attachment.file.path)

        email.send(fail_silently=False)
        reports = ticket.report_ticket.all()  # Uses related_name in ForeignKey

        for report in reports:

            for report_attachment in report.report_attachments.all():

                if report_attachment.file and os.path.isfile(report_attachment.file.path):

                    email.attach_file(report_attachment.file.path)
 
        email.send(fail_silently=False)

        reports = ticket.report_ticket.all()  # Uses related_name in ForeignKey

        for report in reports:
            for report_attachment in report.report_attachments.all():
                if report_attachment.file and os.path.isfile(report_attachment.file.path):
                    email.attach_file(report_attachment.file.path)
        email.send(fail_silently=False)

 
        return f"Email with attachments sent successfully to {recipient_email} for ticket {ticket.ticket_id}."

    except Ticket.DoesNotExist:
        return f"Ticket with ID {ticket_id} not found."
    except Exception as e:
        return f"Error sending email: {str(e)}"


@shared_task
def send_sla_warning_notification(ticket_id, recipient_email, due_date):
    """
    Send a notification when an SLA is about to breach.
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
def send_sla_breach_notification(ticket_id, recipient_email, due_date=None):
    """
    Send a notification when an SLA has been breached.
    """
    subject = f"🚨 SLA BREACHED for Ticket {ticket_id}"

    due_date_info = ""
    if due_date:
        if not isinstance(due_date, str):
            due_date = due_date.strftime("%Y-%m-%d %H:%M:%S")
        due_date_info = f"\nSLA Due Date: {due_date}\n"

    message = f"""
    URGENT: SLA Breach Alert:

    The Service Level Agreement (SLA) for ticket {ticket_id} has been BREACHED.{due_date_info}
    This ticket requires immediate attention and resolution.

    This is an automated message.
    """

    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [recipient_email])
    return f"SLA breach notification sent to {recipient_email} for ticket {ticket_id}"


@shared_task
def check_all_sla_timers():
    """
    Periodic task to check all active SLA timers for warnings and breaches.
    """
    now = timezone.now()
    active_timers = SLATimer.objects.filter(sla_status='Active')

    breach_count = 0
    warning_count = 0

    for timer in active_timers:
        # Check for breach
        if timer.check_sla_breach():
            # Only send notification if it hasn't been sent yet
            if not getattr(timer, 'breach_notification_sent', False):
                send_sla_breach_notification.delay(
                    ticket_id=timer.ticket.ticket_id,
                    recipient_email=timer.ticket.assignee.email,  # Fixed: changed from assigned_to to assignee
                    due_date=timer.due_date
                )
                timer.breach_notification_sent = True
                timer.save(update_fields=['breach_notification_sent'])
            breach_count += 1
            continue  # Skip warning if already breached

        # Send warning 1 hour before due date
        time_to_due = timer.due_date - now
        if timedelta(minutes=0) < time_to_due <= timedelta(hours=1) and not timer.warning_sent:
            send_sla_warning_notification.delay(
                ticket_id=timer.ticket.ticket_id,
                recipient_email=timer.ticket.assignee.email,  # Fixed: changed from assigned_to to assignee
                due_date=timer.due_date
            )
            timer.warning_sent = True
            timer.save(update_fields=['warning_sent'])
            warning_count += 1

    return f"SLA check completed. Found {breach_count} breaches and sent {warning_count} warnings."