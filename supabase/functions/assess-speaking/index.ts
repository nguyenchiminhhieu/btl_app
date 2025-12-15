// Supabase Edge Function: assess-speaking
// Chấm điểm IELTS Speaking với Azure Speech + OpenAI GPT-4o-mini
// Uses FFmpeg to convert m4a/3gp to WAV for Azure compatibility

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// Types
interface PronunciationResult {
  overallScore: number;
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  prosodyScore: number;
}

interface ContentResult {
  bandScore: number;
  fluencyCoherence: { score: number; feedback: string };
  lexicalResource: { score: number; feedback: string };
  grammaticalRange: { score: number; feedback: string };
  taskAchievement: { score: number; feedback: string };
  overallFeedback: string;
  suggestions: string[];
}



// Google Cloud Speech-to-Text (supports m4a natively)
async function transcribeAudio(audioBuffer: ArrayBuffer): Promise<string> {
  const GOOGLE_API_KEY = Deno.env.get('GOOGLE_SPEECH_API_KEY');

  if (!GOOGLE_API_KEY) {
    throw new Error('Google Speech API key not configured');
  }

  console.log('🎤 Transcribing with Google Cloud Speech-to-Text...');
  console.log('Audio buffer size:', audioBuffer.byteLength);

  try {
    // Convert ArrayBuffer to base64
    const audioBytes = new Uint8Array(audioBuffer);
    const base64Audio = btoa(String.fromCharCode(...audioBytes));

    const requestBody = {
      config: {
        encoding: 'LINEAR16', // WAV PCM format
        sampleRateHertz: 16000,
        languageCode: 'en-US',
        enableAutomaticPunctuation: true,
      },
      audio: {
        content: base64Audio,
      },
    };

    const response = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    console.log('Google Speech response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Speech error:', errorText);
      throw new Error(`Google Speech failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Google Speech response:', JSON.stringify(data));

    // Check if there's an error in the response
    if (data.error) {
      console.error('❌ Google API error:', JSON.stringify(data.error));
      throw new Error(`Google Speech API error: ${data.error.message || 'Unknown error'}`);
    }

    const transcript = data.results
      ?.map((result: any) => result.alternatives?.[0]?.transcript)
      .filter(Boolean)
      .join(' ')
      .trim() || '';

    if (!transcript) {
      console.error('❌ Google returned empty transcript');
      console.error('Full response data:', JSON.stringify(data));
      throw new Error('Google Speech could not transcribe the audio');
    }

    console.log('✅ Transcription successful:', transcript);
    return transcript;
  } catch (error) {
    console.error('Error in transcribeAudio:', error);
    throw error;
  }
}

// Azure Pronunciation Assessment
async function assessPronunciation(
  audioBuffer: ArrayBuffer,
  referenceText: string
): Promise<PronunciationResult> {
  const AZURE_SPEECH_KEY = Deno.env.get('AZURE_SPEECH_KEY');
  const AZURE_SPEECH_REGION = Deno.env.get('AZURE_SPEECH_REGION');

  if (!AZURE_SPEECH_KEY || !AZURE_SPEECH_REGION) {
    throw new Error('Azure Speech credentials not configured');
  }

  console.log('📊 Assessing pronunciation with Azure...');
  console.log('Reference text:', referenceText);

  const pronunciationConfig = {
    referenceText: referenceText,
    gradingSystem: 'HundredMark',
    granularity: 'Phoneme',
    dimension: 'Comprehensive',
    enableMiscue: true,
    enableProsodyAssessment: true,
  };

  const url = `https://${AZURE_SPEECH_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': AZURE_SPEECH_KEY,
      'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000', // WAV PCM 16kHz
      'Pronunciation-Assessment': JSON.stringify(pronunciationConfig),
    },
    body: audioBuffer,
  });

  console.log('Azure response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Azure error response:', errorText);
    throw new Error(`Azure Pronunciation Assessment failed: ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  const nbest = data.NBest?.[0];
  const pronAssessment = nbest?.PronunciationAssessment;

  if (!pronAssessment) {
    throw new Error('No pronunciation assessment data received');
  }

  return {
    overallScore: pronAssessment.PronScore || 0,
    accuracyScore: pronAssessment.AccuracyScore || 0,
    fluencyScore: pronAssessment.FluencyScore || 0,
    completenessScore: pronAssessment.CompletenessScore || 0,
    prosodyScore: pronAssessment.ProsodyScore || 0,
  };
}

// OpenAI Content Scoring (Part 1)
async function assessContentPart1(
  transcript: string,
  question: string,
  questionType: string
): Promise<ContentResult> {
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = `Bạn là giám khảo IELTS Speaking chuyên nghiệp. Hãy đánh giá câu trả lời sau đây cho IELTS Speaking Part 1.

THÔNG TIN BÀI THI:
- Phần thi: Part 1
- Loại câu hỏi: ${questionType}
- Câu hỏi: "${question}"
- Câu trả lời của thí sinh: "${transcript}"

YÊU CẦU ĐÁNH GIÁ:
Part 1 yêu cầu câu trả lời ngắn gọn (2-3 câu, khoảng 20-30 giây). Đánh giá dựa trên 4 tiêu chí IELTS Speaking:

1. Fluency and Coherence (Sự trôi chảy và mạch lạc)
2. Lexical Resource (Vốn từ vựng)
3. Grammatical Range and Accuracy (Ngữ pháp)
4. Task Achievement (Trả lời đúng trọng tâm câu hỏi)

HƯỚNG DẪN CHẤM ĐIỂM:
- Mỗi tiêu chí cho điểm từ 0-9 (có thể dùng 0.5 như 6.5, 7.0)
- Điểm tổng là trung bình của 4 tiêu chí
- Part 1 không yêu cầu câu trả lời dài, chỉ cần rõ ràng và đúng trọng tâm

Trả về kết quả dưới dạng JSON với format sau:
{
  "bandScore": 7.0,
  "fluencyCoherence": {
    "score": 7.0,
    "feedback": "Phản hồi chi tiết bằng tiếng Việt"
  },
  "lexicalResource": {
    "score": 7.0,
    "feedback": "Phản hồi chi tiết bằng tiếng Việt"
  },
  "grammaticalRange": {
    "score": 6.5,
    "feedback": "Phản hồi chi tiết bằng tiếng Việt"
  },
  "taskAchievement": {
    "score": 7.0,
    "feedback": "Phản hồi chi tiết bằng tiếng Việt"
  },
  "overallFeedback": "Nhận xét tổng quan bằng tiếng Việt",
  "suggestions": [
    "Gợi ý cải thiện số 1",
    "Gợi ý cải thiện số 2"
  ]
}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Bạn là giám khảo IELTS Speaking chuyên nghiệp. Luôn trả về JSON hợp lệ.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API failed: ${response.statusText}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

// Main handler
serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    // Parse FormData
    const formData = await req.formData();
    const audioFile = formData.get('audioFile') as File;
    const questionId = formData.get('questionId') as string;
    const topicId = formData.get('topicId') as string;
    const questionText = formData.get('questionText') as string;
    const part = parseInt(formData.get('part') as string);

    if (!audioFile || !questionId || !questionText || !part) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Convert audio to ArrayBuffer
    const audioBuffer = await audioFile.arrayBuffer();

    // Step 1: Transcribe audio (Speech-to-Text)
    console.log('Transcribing audio...');
    const transcript = await transcribeAudio(audioBuffer);

    if (!transcript) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Could not transcribe audio',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Step 2: Run in parallel - Pronunciation Assessment + Content Scoring
    console.log('Assessing pronunciation and content...');
    const [pronunciation, content] = await Promise.all([
      assessPronunciation(audioBuffer, transcript),
      part === 1
        ? assessContentPart1(transcript, questionText, 'description')
        : Promise.resolve({} as ContentResult), // Part 2 sẽ implement sau
    ]);

    // Step 3: Return results
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          transcript,
          pronunciation,
          content,
        },
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Error in assess-speaking:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
