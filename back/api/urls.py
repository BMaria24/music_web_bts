from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

router = DefaultRouter()
router.register(r'songs', views.SongViewSet, basename='song')
router.register(r'likes', views.LikeViewSet, basename='like')
router.register(r'playlists', views.PlaylistViewSet, basename='playlist')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', views.register, name='register'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]