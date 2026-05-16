from django.db import models
from django.contrib.auth.models import User


class Song(models.Model):
    """Песня"""
    title = models.CharField(max_length=200)      # Название
    album = models.CharField(max_length=200)      # Альбом (пока строкой)
    artist = models.CharField(max_length=100)     # Исполнитель
    audio_file = models.CharField(max_length=500) # Путь к файлу
    duration = models.CharField(max_length=10)    # "3:46"

    def __str__(self):
        return f"{self.title} — {self.artist}"


class Like(models.Model):
    """Лайк — связь пользователя и песни"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    song = models.ForeignKey(Song, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('user', 'song')  # Один лайк на песню


class Playlist(models.Model):
    """Плейлист пользователя"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    songs = models.ManyToManyField(Song)

    def __str__(self):
        return f"{self.name} ({self.user.username})"