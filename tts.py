"""Speech synthesis module using Azure Edge TTS with Gemini transliteration fallback."""
import io
import os
import asyncio
import edge_tts

# Languages natively supported by Edge TTS (Indian Neural Voices)
VOICE_MAP = {
    'english': {'male': 'en-IN-PrabhatNeural', 'female': 'en-IN-NeerjaNeural'},
    'en': {'male': 'en-IN-PrabhatNeural', 'female': 'en-IN-NeerjaNeural'},
    'hindi': {'male': 'hi-IN-MadhurNeural', 'female': 'hi-IN-SwaraNeural'},
    'hi': {'male': 'hi-IN-MadhurNeural', 'female': 'hi-IN-SwaraNeural'},
    'tamil': {'male': 'ta-IN-ValluvarNeural', 'female': 'ta-IN-PallaviNeural'},
    'ta': {'male': 'ta-IN-ValluvarNeural', 'female': 'ta-IN-PallaviNeural'},
    'telugu': {'male': 'te-IN-MohanNeural', 'female': 'te-IN-ShrutiNeural'},
    'te': {'male': 'te-IN-MohanNeural', 'female': 'te-IN-ShrutiNeural'},
    'bengali': {'male': 'bn-IN-BashkarNeural', 'female': 'bn-IN-TanishaaNeural'},
    'bn': {'male': 'bn-IN-BashkarNeural', 'female': 'bn-IN-TanishaaNeural'},
    'marathi': {'male': 'mr-IN-ManoharNeural', 'female': 'mr-IN-AarohiNeural'},
    'mr': {'male': 'mr-IN-ManoharNeural', 'female': 'mr-IN-AarohiNeural'},
    'kannada': {'male': 'kn-IN-GaganNeural', 'female': 'kn-IN-SapnaNeural'},
    'kn': {'male': 'kn-IN-GaganNeural', 'female': 'kn-IN-SapnaNeural'},
    'gujarati': {'male': 'gu-IN-NiranjanNeural', 'female': 'gu-IN-DhwaniNeural'},
    'gu': {'male': 'gu-IN-NiranjanNeural', 'female': 'gu-IN-DhwaniNeural'},
    'malayalam': {'male': 'ml-IN-MidhunNeural', 'female': 'ml-IN-SobhanaNeural'},
    'ml': {'male': 'ml-IN-MidhunNeural', 'female': 'ml-IN-SobhanaNeural'},
    'urdu': {'male': 'ur-IN-SalmanNeural', 'female': 'ur-IN-GulNeural'},
    'ur': {'male': 'ur-IN-SalmanNeural', 'female': 'ur-IN-GulNeural'},
}

# Global languages (Edge TTS supports all of these)
GLOBAL_VOICE_MAP = {
    'spanish': {'male': 'es-ES-AlvaroNeural', 'female': 'es-ES-ElviraNeural'},
    'french': {'male': 'fr-FR-HenriNeural', 'female': 'fr-FR-DeniseNeural'},
    'portuguese': {'male': 'pt-BR-AntonioNeural', 'female': 'pt-BR-FranciscaNeural'},
    'german': {'male': 'de-DE-ConradNeural', 'female': 'de-DE-KatjaNeural'},
    'arabic': {'male': 'ar-SA-HamedNeural', 'female': 'ar-SA-ZariyahNeural'},
    'chinese (simplified)': {'male': 'zh-CN-YunxiNeural', 'female': 'zh-CN-XiaoxiaoNeural'},
    'japanese': {'male': 'ja-JP-KeitaNeural', 'female': 'ja-JP-NanamiNeural'},
    'korean': {'male': 'ko-KR-InJoonNeural', 'female': 'ko-KR-SunHiNeural'},
    'russian': {'male': 'ru-RU-DmitryNeural', 'female': 'ru-RU-SvetlanaNeural'},
    'indonesian': {'male': 'id-ID-ArdiNeural', 'female': 'id-ID-GadisNeural'},
    'thai': {'male': 'th-TH-NiwatNeural', 'female': 'th-TH-PremwadeeNeural'},
    'vietnamese': {'male': 'vi-VN-NamMinhNeural', 'female': 'vi-VN-HoaiMyNeural'},
}
VOICE_MAP.update(GLOBAL_VOICE_MAP)

_TTS_CACHE: dict[tuple[str, str], bytes] = {}

async def generate_edge_audio(text: str, voice: str) -> bytes:
    communicate = edge_tts.Communicate(text, voice)
    audio_data = b""
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_data += chunk["data"]
    return audio_data

def synthesize_text(payload: dict) -> bytes:
    """Synthesize text into MP3 audio bytes using Azure Edge TTS."""
    clean_text = str(payload.get("text", "") or "").strip()
    if not clean_text:
        raise ValueError("No text provided for speech synthesis.")

    clean_text = clean_text[:3000]

    raw_lang = str(payload.get("language", "en")).strip().lower()
    gender = str(payload.get("gender", "female")).strip().lower()
    if gender not in ('male', 'female'):
        gender = 'female'
        
    voice = None
    if raw_lang in VOICE_MAP:
        voice = VOICE_MAP[raw_lang][gender]
    
    # If not supported by Edge TTS natively, use Gemini transliteration fallback to English
    if not voice:
        import agent
        from google import genai
        
        key = agent._get_active_key()
        if not key:
            raise ValueError(f"TTS audio is not natively supported for {raw_lang.title()}, and Gemini fallback is unavailable.")
        
        client = genai.Client(api_key=key)
        prompt = f"Transliterate the following {raw_lang.title()} text into the Latin alphabet (using English letters, phonetic spelling) so it can be spoken accurately by an Indian English Text-to-Speech engine. Output ONLY the transliterated text, nothing else, without quotes or markdown.\n\nText:\n{clean_text}"
        
        try:
            response = client.models.generate_content(
                model=agent.GEMINI_MODEL,
                contents=prompt
            )
            clean_text = response.text.strip()
            voice = VOICE_MAP['en'][gender] # Fallback to Indian English male/female
        except Exception as e:
            raise ValueError(f"TTS audio is not natively supported for {raw_lang.title()}, and transliteration failed: {str(e)}")

    cache_key = (clean_text, voice)
    if cache_key in _TTS_CACHE:
        return _TTS_CACHE[cache_key]

    try:
        # Run async edge-tts in a synchronous wrapper
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        mp3_data = loop.run_until_complete(generate_edge_audio(clean_text, voice))
        loop.close()
    except Exception as e:
        raise ValueError(f"Edge TTS generation failed: {str(e)}")

    if not mp3_data:
        raise ValueError("Audio generation resulted in empty data.")

    if len(_TTS_CACHE) > 100:
        _TTS_CACHE.clear()
    _TTS_CACHE[cache_key] = mp3_data
    return mp3_data
