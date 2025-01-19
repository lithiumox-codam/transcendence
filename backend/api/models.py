from django.db import models

class Leaderboard(models.Model):
    name = models.CharField(max_length=100)
    score = models.IntegerField()
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
