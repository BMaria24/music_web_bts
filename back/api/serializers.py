from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Song, Like, Playlist


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']


class SongSerializer(serializers.ModelSerializer):
    class Meta:
        model = Song
        fields = '__all__'


class LikeSerializer(serializers.ModelSerializer):
    song = serializers.PrimaryKeyRelatedField(queryset=Song.objects.all())
    class Meta:
        model = Like
        fields = '__all__'
        read_only_fields = ['user']


class PlaylistSerializer(serializers.ModelSerializer):
    songs = SongSerializer(many=True, read_only=True)
    
    class Meta:
        model = Playlist
        fields = ['id', 'name', 'songs', 'user']
        read_only_fields = ['user']
