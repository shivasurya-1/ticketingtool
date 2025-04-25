# yourapp/tasks.py

import pandas as pd
from celery import shared_task
from django.contrib.auth import get_user_model
from organisation_details.models import Organisation
from roles_creation.models import Role
from django.core.mail import send_mail
from django.db import IntegrityError
from django.conf import settings

User = get_user_model()

@shared_task
def process_user_excel(file_path, uploaded_by):
    """Celery task to process the Excel file asynchronously."""
    df = pd.read_excel(file_path)

    new_users = []
    failed_records = []
    success_count = 0

    for _, row in df.iterrows():
        try:
            # Fetch Organisation and Role
            organisation = Organisation.objects.filter(name=row["Organisation"]).first()
            role = Role.objects.filter(name=row["Role"]).first()

            # Check if user already exists
            if User.objects.filter(username=row["Username"]).exists():
                failed_records.append({"username": row["Username"], "error": "User already exists"})
                continue

            # Create the user
            user = User(
                username=row["Username"],
                email=row["Email"],
                is_customer=row["Is Customer"],
                organisation=organisation,
                role=role,
                added_by=uploaded_by
            )
            user.set_password("defaultpassword")  # Set a default password
            new_users.append(user)
            success_count += 1

        except IntegrityError as e:
            failed_records.append({"username": row["Username"], "error": str(e)})
        except Exception as e:
            failed_records.append({"username": row.get("Username", "Unknown"), "error": str(e)})

    # Bulk insert new users
    User.objects.bulk_create(new_users)

    # Send email notification for each new user created
    for user in new_users:
        send_mail(
            "Your Account is Ready",
            f"Hello {user.username}, your account has been created. Your default password is 'defaultpassword'.",
            "teerdavenigedela@gmail.com",  # Replace with your admin email
            [user.email],
        )

    # Return summary of the operation
    return { 
        "success": success_count,
        "failed": len(failed_records),
        "failed_records": failed_records,
    }


@shared_task
def send_registration_email(user_id, raw_password):  # ✅ Accept two arguments
    try:
        user = User.objects.get(id=user_id)
        subject = "Welcome to Our Platform!"
        message = (
            f"Hello {user.first_name},\n\n"
            f"Thank you for registering with us. Here are your login credentials:\n\n"
            f"Username: {user.username}\n"
            f"Email: {user.email}\n"
            f"Password: {raw_password}\n\n"  # ✅ Include the generated password
            # "You can log in to your account here: https:///login\n\n"
            "Best regards,\n"
            "Your Support Team"
        )

        send_mail(
            subject,
            message,
            settings.EMAIL_HOST_USER,
            [user.email],
            fail_silently=False,
        )
    except User.DoesNotExist:
        print(f"User with ID {user_id} not found.")
    except Exception as e:
        print(f"Error sending registration email: {str(e)}")



@shared_task
def send_password_update_email(user_email, username):
    subject = "Your Password Has Been Updated"
    message = f"Hello {username},\n\nYour password has been changed successfully. If you did not make this change, please contact support immediately."

    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,  # Ensure this is set in settings.py
        [user_email],
        fail_silently=False
    )


@shared_task
def send_password_update_email(user_email, username):
    subject = "Your Password Has Been Updated"
    message = f"Hello {username},\n\nYour password has been changed successfully. If you did not make this change, please contact support immediately."

    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,  # Ensure this is set in settings.py
        [user_email],
        fail_silently=False
    )