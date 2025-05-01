from django.shortcuts import render, get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import UserProfile
from .serializers import UserProfileSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get(self, request, id=None, pk=None):
        try:
            if request.path.endswith('profile_icon/') and pk is not None:
                profile = get_object_or_404(UserProfile, pk=pk)
                data = {
                    "first_name": profile.first_name,
                    "profile_pic_url": profile.profile_pic.url if profile.profile_pic else None
                }
                return Response(data)

            if id is not None:
                personal_details = get_object_or_404(UserProfile, user__id=id)
                serializer = UserProfileSerializer(personal_details)
                return Response(serializer.data)

            if request.path.endswith('my_profile/'):
                profile = get_object_or_404(UserProfile, user=request.user)
                serializer = UserProfileSerializer(profile)
                return Response(serializer.data)

            personal_details = UserProfile.objects.filter(user=request.user)
            serializer = UserProfileSerializer(personal_details, many=True)
            return Response(serializer.data)
        
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            serializer = UserProfileSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                serializer.save(created_by=request.user, modified_by=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, id=None, pk=None):
        try:
            if pk is not None:
                personal_details = get_object_or_404(UserProfile, pk=pk)
            elif id is not None:
                personal_details = get_object_or_404(UserProfile, user__id=id)
            else:
                personal_details = get_object_or_404(UserProfile, user=request.user)

            if 'delete_profile_pic' in request.data and request.data['delete_profile_pic'] == 'true':
                if personal_details.profile_pic:
                    personal_details.profile_pic.delete(save=False)

            serializer = UserProfileSerializer(
                personal_details,
                data=request.data,
                context={'request': request},
                partial=True  # Important for flexibility
            )
            if serializer.is_valid():
                serializer.save(modified_by=request.user)
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, id=None, pk=None):
        try:
            if pk is not None:
                personal_details = get_object_or_404(UserProfile, pk=pk)
            elif id is not None:
                personal_details = get_object_or_404(UserProfile, user__id=id)
            else:
                personal_details = get_object_or_404(UserProfile, user=request.user)

            if personal_details.profile_pic:
                personal_details.profile_pic.delete(save=False)

            personal_details.delete()
            return Response({"message": "Profile deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
