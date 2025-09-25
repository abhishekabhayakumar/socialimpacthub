import os
import django
import json
import sys

# make sure project root is on sys.path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if project_root not in sys.path:
	sys.path.insert(0, project_root)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ImpactHub.settings')
# During this test we allow the 'testserver' host used by DRF test client
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ImpactHub.settings')
from django.conf import settings as dj_settings
try:
	# modify ALLOWED_HOSTS temporarily
	dj_settings.ALLOWED_HOSTS = list(getattr(dj_settings, 'ALLOWED_HOSTS', [])) + ['testserver']
except Exception:
	pass
django.setup()

from rest_framework.test import APIClient

client = APIClient()
resp = client.post('/api/predict_impact/', data={'title':'Test','area':'Health','description':'Helps people'}, format='json')
print('status', resp.status_code)
print(resp.data)
