import pdb
import uuid
from datetime import datetime, timedelta
import pytz
from django.db import models
# from django.utils.timezone import now
from django.contrib.auth import get_user_model
from django.conf import settings
from django.utils import timezone
import logging
logger = logging.getLogger(__name__)
User = get_user_model()
from organisation_details.models import Organisation
from solution_groups.models import SolutionGroup
from priority.models import Priority
from login_details.models import User
import random,string





class Ticket(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('Working in Progress', 'Working in Progress'),
        ('Waiting for User Response', 'Waiting for User Response'),
        ('Resolved', 'Resolved'),
        ('Closed', 'Closed'),
        ('Breached', 'Breached'),
        ('Canceled', 'Canceled'),
        ('Delegated', 'Delegated')
    ]
    # ISSUE_TYPE = [
    #     ('F', 'Incident'),
    #     ('G', 'Service Request')
    # ]
    IMPACT = [
        ('A', 'High'),
        ('B', 'Medium'),
        ('C', 'Low')
    ]
    SUPPORT = [
        ('a', 'FirstLevel'),
        ('b', 'SecondLevel')
    ]

    # def generate_ticket_id(self):
    #     random_num = random.randint(10000000, 99999999) 
    #     print(f"SRIA{random_num}")
    #     return f"SRIA{random_num}"
    developer_organization = models.ForeignKey(Organisation, on_delete=models.CASCADE, null=True, blank=True)

    assignee = models.ForeignKey("login_details.User", on_delete=models.CASCADE,null=True, related_name='solution_engineer')
    service_domain = models.ForeignKey('services.IssueCategory', on_delete=models.SET_NULL, null=True, blank=True)
    service_type = models.ForeignKey('services.IssueType', on_delete=models.SET_NULL, null=True, blank=True,related_name='s_product')
    solution_grp = models.ForeignKey(SolutionGroup, on_delete=models.SET_NULL, related_name='s_solution_group', null=True, blank=True)
    reference_tickets = models.ManyToManyField('self',blank=True)
    pre_assignee = models.JSONField(default=list,null= True)  # Stores a list of strings
    # issue_type = models.CharField(
    #     max_length=50, 
    #     choices=ISSUE_TYPE, 
    #     blank=True, 
    #     null=True, 
    #     default=""
    # )

    impact = models.CharField(
        max_length=50, 
        choices=IMPACT, 
        blank=True, 
        null=True, 
        default=""
    )
    support_team = models.CharField(max_length=50, choices=SUPPORT,blank=True, 
        null=True, 
        default="")
    customer_number = models.CharField(max_length=50, blank=True, null=True,)
    developer_organization = models.ForeignKey(Organisation, on_delete=models.CASCADE, null=True, blank=True)
    
    # developer_organization = models.ForeignKey(
    #     Organisation, on_delete=models.CASCADE, related_name="organisation_tickets"
    # )
    is_active = models.BooleanField(default=False)
    project = models.CharField(max_length=50)
    product = models.CharField(max_length=30)
    #resolution_steps = models.TextField(blank=True, null=True)
    customer_country = models.CharField(max_length=50, blank=True, null=True)
    ticket_id = models.CharField(
        max_length=32, primary_key=True, unique=True, editable=True
    )
    summary = models.CharField(max_length=50)
    description = models.TextField()
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='open')

    priority = models.ForeignKey(Priority, on_delete=models.SET_NULL,related_name="priority",null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    
    created_by = models.ForeignKey(User, related_name='ticket_created_by', on_delete=models.SET_NULL, null=True, blank=True
    )
    modified_by = models.ForeignKey(User, related_name='ticket_modified_by', on_delete=models.SET_NULL, null=True, blank=True
    )
    VALID_TRANSITIONS = {
        "Open": ["Working in Progress", "Waiting for User Response", "Canceled"],
        "Working in Progress": ["Waiting for User Response", "Resolved", "Breached"],
        "Waiting for User Response": ["Working in Progress", "Canceled"],
        "Resolved": ["Closed"],
        "Breached": ["Closed"],
        "Closed": []
    }

   

    
    def save(self, *args, **kwargs):
        ist = pytz.timezone('Asia/Kolkata')
        current_time = timezone.now().astimezone(ist)

        is_new = self._state.adding  
        
        super().save(*args, **kwargs) 
        sla_timer, created = SLATimer.objects.get_or_create(ticket=self)

        if self.status == "Working in Progress":
            # if created or not sla_timer.start_time:
                
            # else:
            sla_timer.resume_sla()

        elif self.status == "Waiting for User Response":
            sla_timer.pause_sla()

        elif self.status == "Resolved":
            sla_timer.end_time = current_time
            sla_timer.save()

        elif self.status == "Delegated":
            pass
        elif self.status == "Breached":
            sla_timer.end_time = current_time
            sla_timer.breached = True
            sla_timer.save()         
        sla_timer.check_sla_breach()
        super().save(update_fields=['status'])

class Attachment(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='attachments/')
    uploaded_at = models.DateTimeField(auto_now_add=True)


    
    
class SLATimer(models.Model):
    """Model to track SLA start and end times."""
    sla_id = models.AutoField(primary_key=True)
    ticket = models.OneToOneField("timer.Ticket", on_delete=models.CASCADE, related_name="sla_timers")
    # start_time = models.DateTimeField(default=timezone.now().astimezone(pytz.timezone('Asia/Kolkata')))
    start_time = models.DateTimeField(default=timezone.now)
    paused_time = models.DateTimeField(null=True, blank=True)
    resumed_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)
    total_paused_time = models.DurationField(default=timedelta(0))
    sla_due_date = models.DateTimeField(null=True, blank=True)
    breached = models.BooleanField(default=False)
    warning_sent = models.BooleanField(default=False)
    sla_status = models.CharField(max_length=20, choices=[('Active', 'Active'), ('Paused', 'Paused'), ('Stopped', 'Stopped')], default='Active')
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey("login_details.User", null=True, blank=True, on_delete=models.SET_NULL, related_name="sla_created")
    modified_by = models.ForeignKey("login_details.User", null=True, blank=True, on_delete=models.SET_NULL, related_name="sla_modified")
    is_active = models.BooleanField(default=True)
    

      
    def save(self, *args, **kwargs):
        """Ensure SLA due date is calculated when saving."""
        if self.start_time and not self.sla_due_date:
            self.sla_due_date = self.get_sla_due_date()
        super().save(*args, **kwargs)
        # """Calculate total pause time from all PauseLogs dynamically."""
        # total_pause = self.pause_logs.aggregate(total=models.Sum('pause_duration'))['total']
        # return total_pause or timedelta(0)  # Return 0 if no pauses exist
    def total_pause_time(self):
        
        self.total_paused_time = timedelta()

        self.total_paused_time =timezone.now() + self.paused_time
        self.save()
    
    def get_all_paused_times(self):
            """Retrieve and print all paused times from the PauseLogs table related to this SLA Timer."""
            paused_times = PauseLogs.objects.filter(sla_timer=self).values_list('paused_time', flat=True)
            paused_times_list = list(paused_times)
            print("Paused Times:", paused_times_list)
            paused_times_list = [time for time in paused_times if time is not None]

            return paused_times_list
        
    def get_all_resumed_times(self):
            """Retrieve and print all paused times from the PauseLogs table related to this SLA Timer."""
            resumed_times = PauseLogs.objects.filter(sla_timer=self).values_list('resumed_time', flat=True)
            resumed_times_list = list(resumed_times)
            resumed_times_list = [time for time in resumed_times if time is not None]

            print("resumed Times:", resumed_times_list)
            return resumed_times_list
    def get_sla_due_date(self):
        """Calculate SLA due date based on start_time, priority response time, and pause duration."""
        if not self.start_time or not self.ticket or not self.ticket.priority:
            return None

        response_time_target = self.ticket.priority.response_target_time  # SLA target from Priority

        if isinstance(response_time_target, (int, float)):  
            response_time_target = timedelta(hours=response_time_target)  

        total_paused_time = self.total_paused_time  # Get total paused time dynamically

        return self.start_time + response_time_target - total_paused_time

    def start_sla(self):
        """Start SLA when ticket moves to 'Working in Progress'."""
        ist = pytz.timezone('Asia/Kolkata')
        current_time = timezone.now().astimezone(ist)
        if not self.start_time:
            self.start_time = current_time
            self.sla_due_date = self.get_sla_due_date()
            self.sla_status = 'Active'
            self.save()

    def pause_sla(self):
        """Log a pause event when ticket status is 'Waiting for User Response'."""
        ist = pytz.timezone('Asia/Kolkata')
        current_time = timezone.now().astimezone(ist)
        # self.get_all_paused_times()
        


        
        if self.start_time:
            self.paused_time = current_time
            self.sla_due_date = self.get_sla_due_date()
            self.sla_status = 'Paused'
            self.save()
            PauseLogs.objects.create(sla_timer=self, paused_time=current_time)

    def stop_sla(self):
        """Stop SLA when ticket is resolved or closed"""
        self.sla_status = 'Stopped'
        self.save()
            

    def resume_sla(self):
        """Resume SLA and update the latest pause event."""
        # last_pause = self.pause_logs.filter(resumed_time__isnull=True).last()
        # if last_pause:
        self.resumed_time = nows()
        self.sla_status = 'Active'

        self.save()
        PauseLogs.objects.create(sla_timer=self,paused_time=None, resumed_time=nows())


    # def check_sla_breach(self):
    #     if self.get_sla_due_date() and nows() > self.get_sla_due_date():
    #         self.breached = True
    #         self.save()

    # def check_sla_breach(self):
    #     """Check if SLA is breached and handle notifications"""
    #     if not self.sla_due_date or self.sla_status != 'Active':
    #         return False
            
    #     now = timezone.now()
        
    #     # Calculate time remaining until breach
    #     time_remaining = self.sla_due_date - now
        
    #     # SLA already breached
    #     if now > self.sla_due_date and not self.breached:
    #         self.breached = True
    #         self.breach_notified = True
    #         self.save()
            
    #         # Trigger breach notification
    #         self.send_breach_notification()
    #         return True
            
    #     # Send warning notification at 75% of SLA time
    #     if not self.warning_sent:
    #         total_time = self.sla_due_date - self.start_time
    #         warning_threshold = total_time * 0.75
            
    #         if (now - self.start_time) > warning_threshold:
    #             self.warning_sent = True
    #             self.save()
    #             self.send_warning_notification() 
                
    #     return self.breached
    def check_sla_breach(self):
        """
        Check if SLA is breached or approaching breach (75%) and trigger notifications.
        """
        if not self.sla_due_date or self.sla_status != 'Active':
            return False

        now = timezone.now()
        updated = False

        # SLA breached
        if now > self.sla_due_date and not self.breached:
            self.breached = True
            self.breach_notified = True
            updated = True

            try:
                self.send_breach_notification()
            except Exception as e:
                logger.exception(f"Failed to send SLA breach notification for Ticket {self.ticket_id}: {str(e)}")

        # SLA warning (at 75% of SLA time)
        if not self.warning_sent:
            total_time = self.sla_due_date - self.start_time
            warning_threshold = total_time * 0.75

            if (now - self.start_time) > warning_threshold:
                self.warning_sent = True
                updated = True

                try:
                    self.send_warning_notification()
                except Exception as e:
                    logger.exception(f"Failed to send SLA warning for Ticket {self.ticket_id}: {str(e)}")

        if updated:
            self.save()

        return self.breached

    def send_warning_notification(self):
        """Send warning notification that SLA is about to breach"""
        # Get relevant users to notify
        assignee = self.ticket.assignee
        created_by = self.ticket.created_by
        
        # Import here to avoid circular imports
        from .tasks import send_sla_warning_notification
        
        if assignee and assignee.email:
            send_sla_warning_notification.delay(
                ticket_id=str(self.ticket.ticket_id),
                recipient_email=assignee.email,
                due_date=self.sla_due_date
            )
            
    def send_breach_notification(self):
        """Send notification that SLA has been breached"""
        # Get relevant users to notify
        assignee = self.ticket.assignee
        created_by = self.ticket.created_by
        
        # Import here to avoid circular imports
        from .tasks import send_sla_breach_notification
        
        if assignee and assignee.email:
            send_sla_breach_notification.delay(
                ticket_id=str(self.ticket.ticket_id),
                recipient_email=assignee.email
            )

    def calculate_remaining_time(self):
        """Calculate remaining time until SLA breach"""
        if not self.sla_due_date or self.sla_status != 'Active':
            return None
            
        now = timezone.now()
        if now > self.sla_due_date:
            return timezone.timedelta(0)
            
        return self.sla_due_date - now
            
class PauseLogs(models.Model):
    sla_timer = models.ForeignKey(SLATimer, on_delete=models.CASCADE, related_name="pause_logs")
    paused_time = models.DateTimeField(null=True,blank=True)
    resumed_time = models.DateTimeField(null=True, blank=True)
    pause_duration = models.DurationField(default=timedelta)

    def save(self, *args, **kwargs):

        super().save(*args, **kwargs)
        
        
def nows():
    ist = pytz.timezone('Asia/Kolkata')
    current_time = timezone.now().astimezone(ist)
    return current_time







# class SLATimeHistory(models.Model):
#     """Model to store SLA status history."""
#     STATUS_CHOICES = [
#         ('Active', 'Active'),
#         ('Paused', 'Paused'),
#         ('Breached', 'Breached'),
#         ('Closed', 'Closed'),
#         ('Completed', 'Completed')
#     ]

#     ticket = models.ForeignKey("timer.Ticket", on_delete=models.CASCADE, related_name="sla_history")
#     sla_status = models.CharField(max_length=50, choices=STATUS_CHOICES, default="Active")
#     changed_at = models.DateTimeField(auto_now_add=True)
#     changed_by = models.ForeignKey("login_details.User", on_delete=models.SET_NULL, related_name='changed_by', null=True)

#     class Meta:
#         ordering = ['-changed_at']