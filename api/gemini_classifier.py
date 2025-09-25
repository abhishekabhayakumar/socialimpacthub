import os
import json
import requests
from django.conf import settings
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass


def classify_with_raw(title: str, area: str, description: str) -> dict:
    """
    Call the Generative Language API (either generateText for text-bison models or
    generateContent for gemini models). Returns a dict with keys:
      - result: True/False/None
      - raw: the parsed JSON response (if any)
      - text: the extracted textual snippet used for parsing
      - error: error string if any
    """
    api_key = "AIzaSyDqiIXSuvFOfmbQViS7bDs0A-cq2JqYY58"#os.environ.get('GEMINI_API_KEY') or getattr(settings, 'GEMINI_API_KEY', None)
    model = "gemini-2.0-flash"#os.environ.get('GEMINI_MODEL') or getattr(settings, 'GEMINI_MODEL', 'gemini-2.0-flash')

    if not api_key:
        err = 'no API key configured'
        print('Gemini classifier:', err)
        return {'result': None, 'raw': None, 'text': None, 'error': err}

    prompt = (
        "You are a concise classifier. Given the project title, impact area, and description,"
        " decide whether the project is a social impact project. Reply ONLY with a JSON object"
        " with two fields: \"impactful\" (true or false) and \"reason\" (short string).\n\n"
        f"Title: {title}\n"
        f"Impact Area: {area}\n"
        f"Description: {description}\n"
    )

    try:
        if 'text-bison' in model:
            endpoint_base = f"https://generativelanguage.googleapis.com/v1beta2/models/{model}:generateText"
            endpoint = f"{endpoint_base}?key={api_key}"
            payload = {"prompt": {"text": prompt}, "temperature": 0.0, "maxOutputTokens": 256}
            print('Gemini classifier: calling text-bison model', model)
            resp = requests.post(endpoint, json=payload, timeout=15)
        else:
            endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
            headers = {'Content-Type': 'application/json', 'X-goog-api-key': api_key}
            # Minimal, compatible payload for generateContent
            payload = {"contents": [{"parts": [{"text": prompt}] }]}
            print('Gemini classifier: calling model', model)
            resp = requests.post(endpoint, headers=headers, json=payload, timeout=15)

        status = resp.status_code
        text_body = resp.text
        try:
            resp.raise_for_status()
        except Exception:
            err = f"HTTP {status}: {text_body}"
            print('Gemini classifier error:', err)
            # If configured, perform local fallback
            use_fallback = os.environ.get('GEMINI_USE_FALLBACK') or getattr(settings, 'GEMINI_USE_FALLBACK', True)
            if str(use_fallback).lower() in ['1', 'true', 'yes']:
                fallback_result = local_keyword_fallback(title, area, description)
                return {'result': fallback_result, 'raw': None, 'text': text_body, 'error': err}
            return {'result': None, 'raw': None, 'text': text_body, 'error': err}

        data = resp.json()

        # Prefer explicit model response paths to extract the model's textual output
        def extract_model_text(resp_json):
            # gemini generateContent: {'candidates': [{'content': {'parts': [{'text': '...'}]}}]}
            if isinstance(resp_json, dict):
                if 'candidates' in resp_json and isinstance(resp_json['candidates'], list):
                    for cand in resp_json['candidates']:
                        if not isinstance(cand, dict):
                            continue
                        content = cand.get('content') or cand.get('output') or {}
                        if isinstance(content, dict):
                            # new-style: content -> parts -> text
                            parts = content.get('parts')
                            if isinstance(parts, list) and parts:
                                for p in parts:
                                    if isinstance(p, dict) and 'text' in p:
                                        return p['text']
                            # older shapes: content may contain text directly
                            if 'text' in content and isinstance(content['text'], str):
                                return content['text']
                        # fallback: candidate may itself have text-like fields
                        for k, v in cand.items():
                            if isinstance(v, str) and len(v) < 10000:
                                return v
                # text-bison / other: look for 'output' -> 'content' -> 'text' or 'choices'
                if 'output' in resp_json and isinstance(resp_json['output'], dict):
                    out = resp_json['output']
                    if 'content' in out and isinstance(out['content'], dict):
                        parts = out['content'].get('parts')
                        if isinstance(parts, list) and parts:
                            first = parts[0]
                            if isinstance(first, dict) and 'text' in first:
                                return first['text']
                if 'choices' in resp_json and isinstance(resp_json['choices'], list):
                    first = resp_json['choices'][0]
                    if isinstance(first, dict) and 'text' in first:
                        return first['text']
            # as a last resort, search for any string values
            def find_text_values(obj):
                if isinstance(obj, str):
                    return [obj]
                if isinstance(obj, dict):
                    texts = []
                    for v in obj.values():
                        texts.extend(find_text_values(v))
                    return texts
                if isinstance(obj, list):
                    texts = []
                    for item in obj:
                        texts.extend(find_text_values(item))
                    return texts
                return []

            found = find_text_values(resp_json)
            return found[0] if found else None

        extracted = extract_model_text(data)
        text = extracted.strip() if isinstance(extracted, str) and extracted.strip() else json.dumps(data)

        # strip fences
        if text.startswith('```'):
            parts = text.split('```')
            if len(parts) >= 2:
                text = parts[1].strip()

        # normalize and try to extract a JSON object substring if the model prefixed the
        # output with labels like 'json' or other text. This avoids json.loads failing
        # on leading words and falling back to a too-permissive heuristic.
        import re
        json_text = None
        m = re.search(r'({.*})', text, re.DOTALL)
        if m:
            json_text = m.group(1)

        parsed_result = None
        parsed_reason = None
        try:
            # Prefer explicit JSON object if found
            if json_text:
                parsed = json.loads(json_text)
            else:
                parsed = json.loads(text)

            if isinstance(parsed, dict) and 'impactful' in parsed:
                val = parsed.get('impactful')
                # accept booleans or string representations
                if isinstance(val, bool):
                    parsed_result = val
                elif isinstance(val, str):
                    parsed_result = val.strip().lower() in ('true', 'yes', '1')
                else:
                    parsed_result = bool(val)
                # extract optional reason field for UI/debugging
                parsed_reason = parsed.get('reason') if isinstance(parsed, dict) else None
            else:
                parsed_result = None
        except Exception:
            # Controlled heuristics: check for explicit patterns like
            # "impactful": true/false or phrases that clearly indicate false.
            low = text.lower()
            # look for explicit JSON-like or key/value patterns
            m2 = re.search(r'"?impactful"?\s*[:=]\s*(true|false)', low)
            if m2:
                parsed_result = True if m2.group(1) == 'true' else False
            elif re.search(r'not\s+impactful|no\s+impact|not\s+a\s+social', low):
                parsed_result = False
            elif re.search(r'\b(impactful project|social impact|socially impactful)\b', low):
                parsed_result = True
            else:
                parsed_result = None
                parsed_reason = None

        return {'result': parsed_result, 'raw': data, 'text': text, 'reason': parsed_reason, 'error': None}

    except Exception as exc:
        err = str(exc)
        print('Gemini classifier unexpected error:', err)
        # fallback on unexpected errors if enabled
        use_fallback = os.environ.get('GEMINI_USE_FALLBACK') or getattr(settings, 'GEMINI_USE_FALLBACK', True)
        if str(use_fallback).lower() in ['1', 'true', 'yes']:
            fallback_result = local_keyword_fallback(title, area, description)
            return {'result': fallback_result, 'raw': None, 'text': None, 'error': err}
        return {'result': None, 'raw': None, 'text': None, 'error': err}


def local_keyword_fallback(title: str, area: str, description: str) -> bool:
    """Very simple keyword-based classifier fallback.

    Returns True if any social-impact keywords appear in title/area/description.
    """
    text = f"{title} {area} {description}".lower()
    keywords = [
        'education', 'health', 'sanitation', 'clean water', 'water', 'solar', 'renewable',
        'community', 'poverty', 'microfinance', 'sustainab', 'recycle', 'recycling', 'food', 'hunger',
        'agriculture', 'mental health', 'women', 'child', 'disability', 'access', 'inclusion'
    ]
    for kw in keywords:
        if kw in text:
            return True
    return False


def is_social_impact_project(title: str, area: str, description: str):
    info = classify_with_raw(title, area, description)
    return info.get('result')

