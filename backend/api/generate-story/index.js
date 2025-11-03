/**
 * Vercel Serverless Function - ChatGPT API 사용
 * 
 * 배포 방법:
 * 1. Vercel에 프로젝트 연결
 * 2. Vercel 대시보드에서 OPENAI_API_KEY 환경 변수 설정
 * 3. 자동 배포 완료
 * 
 * 프롬프트 수정:
 * 아래 prompt 변수 부분을 수정하시면 됩니다.
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { basicInfo, scenario } = req.body;

    // 입력 검증
    if (!basicInfo || !scenario) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // ========================================
    // 프롬프트 작성 영역 - 여기를 수정하세요!
    // ========================================
    const prompt = `당신은 멀티버스 이야기를 생성하는 창작자입니다.

현재 멀티버스의 정보:
- 직업: ${basicInfo.job || '정보 없음'}
- 성별: ${basicInfo.gender || '정보 없음'}
- 관심사: ${basicInfo.interests || '정보 없음'}
- 연애상태: ${basicInfo.relationship || '정보 없음'}
- 자녀: ${basicInfo.children || '정보 없음'}

중요한 순간:
${scenario.importantMoment}

대안 선택 (만약 내가 그 때 ... 했다면):
${scenario.alternativeChoice}

위 정보를 바탕으로 다른 멀티버스에서의 삶을 상세하고 감성적으로 묘사해주세요. 
다음 형식의 JSON으로 응답해주세요:

{
  "job": "다른 멀티버스에서의 직업",
  "location": "살고 있는 장소 (국가, 도시)",
  "relationship": "연애상태에 대한 구체적인 설명 (2-3문장)",
  "story": "300-500자 정도의 자세한 이야기"
}`;
    // ========================================
    // 프롬프트 작성 영역 끝
    // ========================================

    // ChatGPT API 호출
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // 비용 절감을 위해 mini 사용, 더 나은 품질을 원하면 'gpt-4' 또는 'gpt-4-turbo' 사용
      messages: [
        {
          role: 'system',
          content: '당신은 창의적이고 감성적인 스토리텔러입니다. 사용자의 입력을 바탕으로 멀티버스 이야기를 생성합니다. 항상 JSON 형식으로 응답합니다.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8, // 창의성 조절 (0.0 ~ 2.0, 높을수록 창의적)
      max_tokens: 1000, // 최대 응답 길이
      response_format: { type: 'json_object' }, // JSON 형식 강제
    });

    const responseText = completion.choices[0].message.content;
    const result = JSON.parse(responseText);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error generating story:', error);
    return res.status(500).json({
      error: 'Failed to generate story',
      message: error.message,
    });
  }
}

