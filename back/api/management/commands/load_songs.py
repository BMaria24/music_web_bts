from django.core.management.base import BaseCommand
from api.models import Song

class Command(BaseCommand):
    help = 'Загружает треки в базу данных'

    def handle(self, *args, **options):
        songs = [
            # MAP OF THE SOUL : 7
            {"title": "Intro : Persona", "album": "MAP OF THE SOUL: 7", "artist": "BTS", "audio_file": "./frontend/music/bts/map_of_the_soul/BTS_-_Intro_Persona_63484519.mp3", "duration": "2:51"},
            {"title": "Boy With Luv (feat. Halsey)", "album": "MAP OF THE SOUL: 7", "artist": "BTS", "audio_file": "./frontend/music/bts/map_of_the_soul/BTS_Halsey_-_Boy_With_Luv_63484523.mp3", "duration": "3:49"},
            {"title": "Make It Right", "album": "MAP OF THE SOUL: 7", "artist": "BTS", "audio_file": "./frontend/music/bts/map_of_the_soul/BTS_-_Make_It_Right_63484527.mp3", "duration": "3:46"},
            {"title": "Jamais Vu", "album": "MAP OF THE SOUL: 7", "artist": "BTS", "audio_file": "./frontend/music/bts/map_of_the_soul/BTS_-_Jamais_Vu_63484530.mp3", "duration": "3:47"},
            {"title": "Dionysus", "album": "MAP OF THE SOUL: 7", "artist": "BTS", "audio_file": "./frontend/music/bts/map_of_the_soul/BTS_-_Dionysus_63484531.mp3", "duration": "4:09"},
            {"title": "Interlude : Shadow", "album": "MAP OF THE SOUL: 7", "artist": "BTS", "audio_file": "./frontend/music/bts/map_of_the_soul/BTS_-_Interlude_Shadow_68489603.mp3", "duration": "4:19"},
            {"title": "Black Swan", "album": "MAP OF THE SOUL: 7", "artist": "BTS", "audio_file": "./frontend/music/bts/map_of_the_soul/BTS_-_Black_Swan_68029009.mp3", "duration": "3:18"},
            {"title": "Filter", "album": "MAP OF THE SOUL: 7", "artist": "BTS", "audio_file": "./frontend/music/bts/map_of_the_soul/BTS_-_Filter_68489604.mp3", "duration": "3:00"},
            {"title": "My Time", "album": "MAP OF THE SOUL: 7", "artist": "BTS", "audio_file": "./frontend/music/bts/map_of_the_soul/BTS_-_My_Time_68489605.mp3", "duration": "3:54"},
            {"title": "Louder than bombs", "album": "MAP OF THE SOUL: 7", "artist": "BTS", "audio_file": "./frontend/music/bts/map_of_the_soul/BTS_-_Louder_than_bombs_68489606.mp3", "duration": "3:37"},
            {"title": "ON", "album": "MAP OF THE SOUL: 7", "artist": "BTS", "audio_file": "./frontend/music/bts/map_of_the_soul/BTS_-_ON_68489607.mp3", "duration": "4:06"},
            {"title": "UGH!", "album": "MAP OF THE SOUL: 7", "artist": "BTS", "audio_file": "./frontend/music/bts/map_of_the_soul/BTS_-_UGH_68489608.mp3", "duration": "3:45"},
            {"title": "00:00 (Zero O'Clock)", "album": "MAP OF THE SOUL: 7", "artist": "BTS", "audio_file": "./frontend/music/bts/map_of_the_soul/BTS_-_0000_Zero_OClock_68489609.mp3", "duration": "4:10"},
            {"title": "Inner Child", "album": "MAP OF THE SOUL: 7", "artist": "BTS", "audio_file": "./frontend/music/bts/map_of_the_soul/BTS_-_Inner_Child_68489610.mp3", "duration": "3:53"},
            {"title": "Friends", "album": "MAP OF THE SOUL: 7", "artist": "BTS", "audio_file": "./frontend/music/bts/map_of_the_soul/BTS_-_Friends_68489611.mp3", "duration": "3:19"},
            {"title": "Moon", "album": "MAP OF THE SOUL: 7", "artist": "BTS", "audio_file": "./frontend/music/bts/map_of_the_soul/BTS_-_Moon_68489612.mp3", "duration": "3:28"},
            {"title": "Respect", "album": "MAP OF THE SOUL: 7", "artist": "BTS", "audio_file": "./frontend/music/bts/map_of_the_soul/BTS_-_Respect_68489613.mp3", "duration": "3:57"},
            {"title": "We are Bulletproof : the Eternal", "album": "MAP OF THE SOUL: 7", "artist": "BTS", "audio_file": "./frontend/music/bts/map_of_the_soul/BTS_-_We_are_Bulletproof_the_Eternal_68489614.mp3", "duration": "4:21"},
            {"title": "Outro : Ego", "album": "MAP OF THE SOUL: 7", "artist": "BTS", "audio_file": "./frontend/music/bts/map_of_the_soul/BTS_-_Outro_Ego_68489615.mp3", "duration": "3:16"},
            {"title": "ON (Feat. Sia)", "album": "MAP OF THE SOUL: 7", "artist": "BTS", "audio_file": "./frontend/music/bts/map_of_the_soul/BTS_Sia_-_ON_68489616.mp3", "duration": "4:06"},
            
            # JIMIN
            {"title": "Promise", "album": "Promise", "artist": "Jimin", "audio_file": "./frontend/music/jimin/Promise/Jimin_BTS_-_Promise.mp3", "duration": "2:31"},
            {"title": "Christmas Love", "album": "Christmas Love", "artist": "Jimin", "audio_file": "./frontend/music/jimin/Christmas Love/Jimin_BTS_-_Christmas_Love.mp3", "duration": "3:17"},
            {"title": "Face off", "album": "FACE", "artist": "Jimin", "audio_file": "./frontend/music/jimin/face/Jimin - Face off.mp3", "duration": "3:49"},
            {"title": "Interlude Dive", "album": "FACE", "artist": "Jimin", "audio_file": "./frontend/music/jimin/face/Jimin - Interlude Dive.mp3", "duration": "2:11"},
            {"title": "Like Crazy (English Version)", "album": "FACE", "artist": "Jimin", "audio_file": "./frontend/music/jimin/face/Jimin - Like Crazy (English Version).mp3", "duration": "3:32"},
            {"title": "Alone", "album": "FACE", "artist": "Jimin", "audio_file": "./frontend/music/jimin/face/Jimin - Alone.mp3", "duration": "3:31"},
            {"title": "Set Me Free Pt.2", "album": "FACE", "artist": "Jimin", "audio_file": "./frontend/music/jimin/face/Jimin - Set Me Free Pt.2.mp3", "duration": "3:22"},
            {"title": "Like crazy", "album": "FACE", "artist": "Jimin", "audio_file": "./frontend/music/jimin/face/Jimin - Like crazy.mp3", "duration": "3:32"},
            {"title": "Letter", "album": "FACE", "artist": "Jimin", "audio_file": "./frontend/music/jimin/face/Jimin - Letter.mp3", "duration": "3:53"},
            {"title": "Closer Than This", "album": "Closer Than This", "artist": "Jimin", "audio_file": "./frontend/music/jimin/Closer Than This/Jimin_BTS_-_Closer_Than_This.mp3", "duration": "3:43"},
        ]
        
        for song_data in songs:
            Song.objects.get_or_create(**song_data)
        
        self.stdout.write(self.style.SUCCESS(f'Загружено {len(songs)} треков'))