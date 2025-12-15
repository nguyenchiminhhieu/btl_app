import OpenAI from 'openai';

// Lazy initialization - only create client when needed
let openai = null;

function getOpenAIClient() {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

/**
 * Assess content quality using OpenAI GPT-4o-mini
 * @param {string} transcript - User's spoken answer
 * @param {string} question - IELTS question
 * @param {Object} pronunciationData - Azure pronunciation assessment results
 * @returns {Promise<Object>} Content assessment with band scores and feedback
 */
export async function assessContent(transcript, question, pronunciationData = {}) {
  try {
    console.log('🤖 Assessing content with OpenAI...');
    console.log(`Question: ${question}`);
    console.log(`Transcript: ${transcript}`);
    console.log(`Pronunciation Score: ${pronunciationData.pronunciationScore || 'N/A'}`);

    // Build pronunciation context from Azure data
    const pronunciationContext = pronunciationData.pronunciationScore 
      ? `\n\nDỮ LIỆU PHÁT ÂM TỪ AZURE SPEECH:
- Điểm phát âm tổng thể: ${pronunciationData.pronunciationScore}/100
- Độ chính xác (Accuracy): ${pronunciationData.accuracyScore}/100
- Độ trôi chảy (Fluency): ${pronunciationData.fluencyScore}/100
- Độ hoàn thiện (Completeness): ${pronunciationData.completenessScore}/100
- Âm điệu (Prosody): ${pronunciationData.prosodyScore}/100

Các từ phát âm có vấn đề: ${pronunciationData.words?.filter(w => w.accuracyScore < 60).map(w => `"${w.word}" (${w.accuracyScore})`).join(', ') || 'Không có'}`
      : '';

    const prompt = `Bạn là giám khảo IELTS Speaking chuyên nghiệp với hơn 10 năm kinh nghiệm chấm thi tại British Council và IDP. Hãy đánh giá câu trả lời sau đây cho IELTS Speaking Part 1 một cách TRUNG THỰC, KHÁCH QUAN và CHÍNH XÁC như một giám khảo thực thụ.

THÔNG TIN BÀI THI:
- Phần thi: IELTS Speaking Part 1
- Câu hỏi: "${question}"
- Câu trả lời của thí sinh: "${transcript}"${pronunciationContext}

IELTS SPEAKING BAND DESCRIPTORS (Bản chính thức):

**BAND 9:**
- Fluency: speaks fluently with only rare repetition/self-correction, hesitation is content-related
- Lexical: uses vocabulary with full flexibility and precision, idiomatic language naturally
- Grammar: full range of structures naturally, consistently accurate apart from native-like slips
- Pronunciation: full range of features with precision, effortless to understand

**BAND 8:**
- Fluency: fluent with occasional repetition, hesitation usually content-related
- Lexical: wide vocabulary readily and flexibly, less common/idiomatic vocabulary skilfully
- Grammar: wide range of structures flexibly, majority error-free sentences
- Pronunciation: wide range of features, easy to understand, L1 accent minimal effect

**BAND 7:**
- Fluency: speaks at length without noticeable effort, may have language-related hesitation
- Lexical: flexible vocabulary for variety of topics, some less common/idiomatic vocabulary
- Grammar: range of complex structures with flexibility, frequently error-free sentences
- Pronunciation: shows Band 6 features plus some Band 8 features

**BAND 6:**
- Fluency: willing to speak at length, may lose coherence due to repetition/hesitation
- Lexical: wide enough vocabulary to discuss at length despite inappropriacies
- Grammar: mix of simple and complex structures with limited flexibility
- Pronunciation: range of features with mixed control, generally understood

**BAND 5:**
- Fluency: maintains flow but uses repetition/self-correction/slow speech
- Lexical: talks about topics with limited flexibility, paraphrase with mixed success
- Grammar: basic sentences with reasonable accuracy, limited complex structures with errors
- Pronunciation: limited range, frequent lapses and mispronunciations

**BAND 4:**
- Fluency: simple speech fluent but complex causes problems, noticeable pauses
- Lexical: basic meaning on familiar topics, frequent errors in word choice
- Grammar: basic sentence forms, some correct simple sentences, errors frequent
- Pronunciation: limited features, some intelligibility issues

**BAND 3-0: Increasingly limited communication ability**

YÊU CẦU CHẤM ĐIỂM:
Đánh giá theo 4 tiêu chí chính:

1. **Fluency and Coherence**: Sử dụng dữ liệu Fluency từ Azure. Xét repetition, self-correction, hesitation, connectives usage
2. **Lexical Resource**: Xét vocabulary range, flexibility, collocations, idiomatic language, paraphrasing
3. **Grammatical Range and Accuracy**: Xét sentence structures variety, error frequency, comprehension impact
4. **Pronunciation**: **SỬ DỤNG dữ liệu Azure Speech**. Xét clarity, features range, intelligibility, L1 accent effect

NGUYÊN TẮC:
- Part 1: Câu trả lời ngắn gọn (2-3 câu, 20-30 giây) là bình thường
- Chấm từ 0-9 với bước 0.5
- Band Score = trung bình 4 tiêu chí
- So sánh với Band Descriptors phía trên để chấm chính xác
- Câu trả lời < 10 từ: trừ điểm Fluency nghiêm trọng
- Không trả lời đúng câu hỏi: trừ điểm tất cả tiêu chí

Trả về kết quả dưới dạng JSON:
{
  "bandScore": 7.0,
  "fluencyCoherence": 7.0,
  "lexicalResource": 7.0,
  "grammaticalRange": 7.0,
  "pronunciation": 7.0,
  "feedback": "Nhận xét tổng quan bằng tiếng Việt, 3-4 câu, phân tích điểm mạnh và yếu",
  "strengths": [
    "Điểm mạnh cụ thể 1 (kèm ví dụ)",
    "Điểm mạnh cụ thể 2"
  ],
  "improvements": [
    "Gợi ý cải thiện cụ thể 1 (kèm ví dụ)",
    "Gợi ý cải thiện cụ thể 2"
  ],
  "detailedAnalysis": {
    "wordCount": 25,
    "answerRelevance": "Có trả lời đúng câu hỏi không",
    "keyVocabulary": ["từ vựng", "tốt", "đã dùng"],
    "grammarIssues": ["Lỗi ngữ pháp nếu có"],
    "pronunciationIssues": ["Từ phát âm sai (từ Azure data)"]
  }
}`;

    const client = getOpenAIClient();
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Bạn là giám khảo IELTS Speaking chuyên nghiệp. Luôn trả về JSON hợp lệ.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const result = JSON.parse(completion.choices[0].message.content);
    
    console.log('✅ Content assessment complete');
    console.log('Band score:', result.bandScore);

    return result;
  } catch (error) {
    console.error('❌ OpenAI error:', error);
    throw new Error(`OpenAI assessment failed: ${error.message}`);
  }
}

/**
 * Assess Part 2 content quality using OpenAI GPT-4o-mini with cue card context
 * @param {string} transcript - User's spoken answer
 * @param {Object} part2Context - Complete Part 2 context (cue card, topic, etc.)
 * @param {Object} pronunciationData - Azure pronunciation assessment results
 * @returns {Promise<Object>} Part 2 content assessment with band scores and feedback
 */
export async function assessPart2Content(transcript, part2Context, pronunciationData = {}) {
  try {
    console.log('🤖 Assessing Part 2 content with OpenAI...');
    console.log(`Cue Card: ${part2Context.cueCard.mainPrompt}`);
    console.log(`Transcript: ${transcript}`);
    console.log(`Pronunciation Score: ${pronunciationData.pronunciationScore || 'N/A'}`);

    // Build pronunciation context from Azure data
    const pronunciationContext = pronunciationData.pronunciationScore 
      ? `\n\nDỮ LIỆU PHÁT ÂM TỪ AZURE SPEECH:
- Điểm phát âm tổng thể: ${pronunciationData.pronunciationScore}/100
- Độ chính xác (Accuracy): ${pronunciationData.accuracyScore}/100
- Độ trôi chảy (Fluency): ${pronunciationData.fluencyScore}/100
- Độ hoàn thiện (Completeness): ${pronunciationData.completenessScore}/100
- Âm điệu (Prosody): ${pronunciationData.prosodyScore}/100

Các từ phát âm có vấn đề: ${pronunciationData.words?.filter(w => w.accuracyScore < 60).map(w => `"${w.word}" (${w.accuracyScore})`).join(', ') || 'Không có'}`
      : '';

    // Build preparation notes context
    const preparationNotesContext = part2Context.preparationNotes 
      ? `\n\nGHI CHÚ CHUẨN BỊ CỦA THÍ SINH:\n"${part2Context.preparationNotes}"`
      : '\n\nGHI CHÚ CHUẨN BỊ: Không có ghi chú';

    const prompt = `Bạn là giám khảo IELTS Speaking chuyên nghiệp với hơn 10 năm kinh nghiệm chấm thi tại British Council và IDP. Hãy đánh giá câu trả lời sau đây cho IELTS Speaking Part 2 một cách TRUNG THỰC, KHÁCH QUAN và CHÍNH XÁC như một giám khảo thực thụ.

THÔNG TIN BÀI THI PART 2:
- Phần thi: IELTS Speaking Part 2 (Long Turn / Cue Card)
- Chủ đề: "${part2Context.topic.title}" (Category: ${part2Context.topic.category})
- Độ khó: ${part2Context.topic.difficulty}
- Thời gian chuẩn bị: ${part2Context.cueCard.preparationTime} giây
- Thời gian nói yêu cầu: ${part2Context.expectedDuration}

CUE CARD ĐẦY ĐỦ:
"${part2Context.cueCard.mainPrompt}

You should say:
${part2Context.cueCard.bulletPoints.map(point => `• ${point}`).join('\n')}

${part2Context.cueCard.followUpQuestion}"${preparationNotesContext}

CÂU TRẢ LỜI CỦA THÍ SINH:
"${transcript}"${pronunciationContext}

YÊU CẦU ĐÁNH GIÁ PART 2:

1. TIÊU CHÍ CHẤM ĐIỂM IELTS SPEAKING PART 2:
   - Fluency & Coherence (25%): Độ trôi chảy, logic, liên kết ý tưởng
   - Lexical Resource (25%): Vốn từ vựng, sử dụng từ chính xác
   - Grammatical Range & Accuracy (25%): Ngữ pháp đa dạng và chính xác
   - Pronunciation (25%): Phát âm, trọng âm, ngữ điệu

2. ĐẶC ĐIỂM PART 2:
   - Thí sinh phải nói liên tục 1-2 phút không bị gián đoạn
   - Phải trả lời TẤT CẢ các bullet points trong cue card
   - Cần có cấu trúc rõ ràng: mở đầu → các điểm chính → kết luận
   - Sử dụng discourse markers để liên kết ý tưởng
   - Thể hiện khả năng duy trì bài nói dài

3. PHẢN HỒI JSON (PHẢI CHÍNH XÁC):
{
  "bandScore": <điểm band tổng thể 0-9, bước 0.5>,
  "fluencyCoherence": <điểm 0-9, bước 0.5>,
  "lexicalResource": <điểm 0-9, bước 0.5>,
  "grammaticalRange": <điểm 0-9, bước 0.5>,
  "pronunciation": <điểm 0-9, bước 0.5>,
  "feedback": "<nhận xét tổng quan ngắn gọn về bài nói>",
  "strengths": [
    "<điểm mạnh 1>",
    "<điểm mạnh 2>",
    "<điểm mạnh 3>"
  ],
  "improvements": [
    "<cần cải thiện 1>",
    "<cần cải thiện 2>",
    "<cần cải thiện 3>"
  ]
}

HƯỚNG DẪN CHI TIẾT:
- Kiểm tra xem thí sinh có trả lời đầy đủ tất cả bullet points không
- Đánh giá độ dài bài nói (nên 90-120 giây cho band cao)
- Chú ý cấu trúc và logic của bài nói
- Đánh giá việc sử dụng linking words và discourse markers
- Xem xét độ tự nhiên và tự tin khi nói
- Feedback phải cụ thể cho Part 2, không chung chung

HÃY CHẤM ĐIỂM NGHIÊM KHẮC NHƯ GIÁM KHẢO THỰC TẾ!`;

    const client = getOpenAIClient();
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const result = JSON.parse(completion.choices[0].message.content);
    
    console.log('✅ Part 2 content assessment complete');
    console.log('Part 2 Band score:', result.bandScore);

    return result;
  } catch (error) {
    console.error('❌ Part 2 OpenAI error:', error);
    throw new Error(`Part 2 OpenAI assessment failed: ${error.message}`);
  }
}
