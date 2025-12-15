"""
Azure Speech pronunciation assessment using Python SDK
Called from Node.js backend via subprocess
"""
import sys
import json
import azure.cognitiveservices.speech as speechsdk
from pathlib import Path

def assess_pronunciation(wav_file_path, reference_text, speech_key, speech_region):
    """
    Assess pronunciation using Azure Speech SDK
    Returns JSON with scores and transcript
    """
    try:
        # Create speech config
        speech_config = speechsdk.SpeechConfig(subscription=speech_key, region=speech_region)
        speech_config.speech_recognition_language = "en-US"
        
        # Enable detailed recognition results
        speech_config.output_format = speechsdk.OutputFormat.Detailed
        
        # Create audio config from WAV file
        audio_config = speechsdk.audio.AudioConfig(filename=wav_file_path)
        
        # Create speech recognizer FIRST
        speech_recognizer = speechsdk.SpeechRecognizer(
            speech_config=speech_config,
            audio_config=audio_config
        )
        
        # Add phrase hints AFTER creating recognizer
        phrase_list_grammar = speechsdk.PhraseListGrammar.from_recognizer(speech_recognizer)
        
        # Add reference text words as hints
        for word in reference_text.split():
            phrase_list_grammar.addPhrase(word)
        
        # Configure pronunciation assessment for UNSCRIPTED mode (IELTS speaking)
        # In unscripted mode, we don't need exact reference text match
        # Azure will score based on pronunciation quality, not content matching
        pronunciation_config = speechsdk.PronunciationAssessmentConfig(
            reference_text="",  # Empty for unscripted mode
            grading_system=speechsdk.PronunciationAssessmentGradingSystem.HundredMark,
            granularity=speechsdk.PronunciationAssessmentGranularity.Word,  # Word level for unscripted
            enable_miscue=False  # Disable for unscripted (no reference to compare)
        )
        pronunciation_config.enable_prosody_assessment()
        
        # For unscripted mode, we focus on pronunciation, fluency, and prosody
        # NOT on content matching (that's what OpenAI will handle)
        
        # Apply pronunciation assessment config
        pronunciation_config.apply_to(speech_recognizer)
        
        # Perform recognition
        result = speech_recognizer.recognize_once_async().get()
        
        # Check result
        if result.reason == speechsdk.ResultReason.RecognizedSpeech:
            pronunciation_result = speechsdk.PronunciationAssessmentResult(result)
            
            # Extract scores
            response_data = {
                "success": True,
                "transcript": result.text,
                "pronunciationScore": pronunciation_result.pronunciation_score,
                "accuracyScore": pronunciation_result.accuracy_score,
                "fluencyScore": pronunciation_result.fluency_score,
                "completenessScore": pronunciation_result.completeness_score,
                "prosodyScore": pronunciation_result.prosody_score,
            }
            
            return response_data
            
        elif result.reason == speechsdk.ResultReason.NoMatch:
            return {
                "success": False,
                "error": "No speech could be recognized"
            }
            
        elif result.reason == speechsdk.ResultReason.Canceled:
            cancellation = result.cancellation_details
            return {
                "success": False,
                "error": f"Recognition canceled: {cancellation.reason}",
                "details": cancellation.error_details
            }
        else:
            return {
                "success": False,
                "error": f"Unexpected result reason: {result.reason}"
            }
            
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    if len(sys.argv) != 5:
        print(json.dumps({
            "success": False,
            "error": "Usage: python azure-speech-python.py <wav_file> <reference_text> <speech_key> <speech_region>"
        }))
        sys.exit(1)
    
    wav_file = sys.argv[1]
    reference_text = sys.argv[2]
    speech_key = sys.argv[3]
    speech_region = sys.argv[4]
    
    # Check if file exists
    if not Path(wav_file).exists():
        print(json.dumps({
            "success": False,
            "error": f"WAV file not found: {wav_file}"
        }))
        sys.exit(1)
    
    # Perform assessment
    result = assess_pronunciation(wav_file, reference_text, speech_key, speech_region)
    
    # Output JSON result
    print(json.dumps(result))
