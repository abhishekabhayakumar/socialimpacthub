from django.contrib import admin
from .models import User, Project, Comment, Support

admin.site.register(User)
admin.site.register(Project)
admin.site.register(Comment)
admin.site.register(Support)
