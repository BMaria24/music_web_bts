from django.contrib import admin
from .models import Song, Like, Playlist

@admin.register(Song)
class SongAdmin(admin.ModelAdmin):
    list_display = ('title', 'artist', 'album', 'duration')
    list_filter = ('artist', 'album')
    search_fields = ('title', 'album')

@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ('user', 'song')

@admin.register(Playlist)
class PlaylistAdmin(admin.ModelAdmin):
    list_display = ('name', 'user')