from django.db import models
from django.db.models.signals import post_save
from django.contrib.auth.models import AbstractUser

# Create your models here.
class User(AbstractUser):
    username = models.CharField(max_length=100)
    email = models.EmailField(unique=True)

    # Use email instead of username when logging in
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def profile(self):
        profile = Profile.objects.get(user=self)

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=100)
    bio = models.CharField(max_length=150)
    image = models.ImageField(upload_to='user_images', default='default.jpg')
    verified = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if self.full_name == "" or self.full_name == None:
            self.full_name = self.user.username
        super(Profile, self).save(*args, **kwargs)

    def __str__(self):
        return self.full_name
    
    class Meta:
        db_table = 'Profile'
        verbose_name_plural = 'Profile'
    


# Signal Function: creates profile when the user is created
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

# Updates the profile whenever the user changes
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()


post_save.connect(create_user_profile, sender=User)
post_save.connect(save_user_profile, sender=User)


class Chat(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='user')
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='sender')
    receiver = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='receiver')
    message = models.CharField(max_length=100000)
    is_read = models.BooleanField(default=False)
    sent_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.sender} - {self.receiver}'

    class Meta:
        ordering = ['-sent_at']
        db_table = 'Chat'
        verbose_name_plural = 'Chat'

    # @property - python decorator
    # Turns methods into attribute-like property
    # Returns the sender and receiver profiles

    @property
    def sender_profile(self):
        sender_profile = Profile.objects.get(user=self.sender)
        return sender_profile
    @property
    def receiver_profile(self):
        receiver_profile = Profile.objects.get(user=self.receiver)
        return receiver_profile