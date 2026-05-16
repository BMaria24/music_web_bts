from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Song, Like, Playlist
from .serializers import SongSerializer, LikeSerializer, PlaylistSerializer, UserSerializer
from rest_framework.decorators import action


class SongViewSet(viewsets.ModelViewSet):
    queryset = Song.objects.all()
    serializer_class = SongSerializer
    permission_classes = [AllowAny]


class LikeViewSet(viewsets.ModelViewSet):
    serializer_class = LikeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Like.objects.filter(user=self.request.user)
       
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class PlaylistViewSet(viewsets.ModelViewSet):
    serializer_class = PlaylistSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Playlist.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def add_song(self, request, pk=None):
        playlist = self.get_object()
        song_id = request.data.get('song_id')
        if not song_id:
            return Response({'error': 'song_id required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            song = Song.objects.get(id=song_id)
            playlist.songs.add(song)
            return Response({'message': 'Добавлено'})
        except Song.DoesNotExist:
            return Response({'error': 'Песня не найдена'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'])
    def remove_song(self, request, pk=None):
        playlist = self.get_object()
        song_id = request.data.get('song_id')
        if not song_id:
            return Response({'error': 'song_id required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            song = Song.objects.get(id=song_id)
            playlist.songs.remove(song)
            return Response({'message': 'Удалено'})
        except Song.DoesNotExist:
            return Response({'error': 'Песня не найдена'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response({'error': 'Заполните все поля'}, status=status.HTTP_400_BAD_REQUEST)
    
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Пользователь уже существует'}, status=status.HTTP_400_BAD_REQUEST)
    
    user = User.objects.create_user(username=username, password=password)
    return Response({'message': 'Регистрация успешна', 'username': user.username}, status=status.HTTP_201_CREATED)