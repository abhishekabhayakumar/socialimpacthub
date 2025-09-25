"""Simple script to validate Gemini API key and model.

Usage (PowerShell):
  python .\tools\check_gemini_key.py

It reads GEMINI_API_KEY and GEMINI_MODEL from environment or .env at project root.
"""
import os
import json
import requests
from pathlib import Path

try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

API_KEY = os.environ.get('GEMINI_API_KEY')
MODEL = os.environ.get('GEMINI_MODEL', 'gemini-2.0-flash')

if not API_KEY:
    print('No GEMINI_API_KEY found in environment or .env. Set GEMINI_API_KEY and try again.')
    raise SystemExit(1)

sample_prompt = 'You are a classifier. Answer with JSON {"impactful": true} or {"impactful": false}.\nTitle: Test\nImpact Area: test\nDescription: test'

def call_text_bison(model, key):
    endpoint = f"https://generativelanguage.googleapis.com/v1beta2/models/{model}:generateText?key={key}"
    payload = {"prompt": {"text": sample_prompt}, "temperature": 0.0, "maxOutputTokens": 60}
    print('Calling', endpoint)
    r = requests.post(endpoint, json=payload, timeout=15)
    print('Status:', r.status_code)
    try:
        print(json.dumps(r.json(), indent=2))
    except Exception:
        print(r.text)

def call_gemini(model, key):
    endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    headers = {'Content-Type': 'application/json', 'X-goog-api-key': key}
    payload = {"contents": [{"parts": [{"text": sample_prompt}]}]}
    print('Calling', endpoint)
    r = requests.post(endpoint, headers=headers, json=payload, timeout=15)
    print('Status:', r.status_code)
    try:
        print(json.dumps(r.json(), indent=2))
    except Exception:
        print(r.text)

print('Using model:', MODEL)
if 'text-bison' in MODEL:
    call_text_bison(MODEL, API_KEY)
else:
    call_gemini(MODEL, API_KEY)
