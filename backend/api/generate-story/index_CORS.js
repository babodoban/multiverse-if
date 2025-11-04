import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// JSON 파싱 미들웨어
app.use(bodyParser.json());

// ✅ 동적 CORS 처리
app.use((req, res, next) => {
  const originHeader = req.headers.origin || 'null';
  const allowedOrigin =
    !originHeader || originHeader === 'null' || originHeader === 'file://'
      ? '*'
      : originHeader;

  const corsHeaders = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
    'Cache-Control': 'no-store', // ✅ iOS Preflight 캐싱 방지
    'Vary': 'Origin', // ✅ Origin별 캐시 구분
  };

  // OPTIONS 요청 (Preflight) 즉시 응답
  if (req.method === 'OPTIONS') {
    res.writeHead(200, corsHeaders);
    res.end();
    return;
  }

  // 모든 응답에 CORS 헤더 추가
  Object.entries(corsHeaders).forEach(([key, value]) =>
    res.setHeader(key, value)
  );

  next();
});

// ✅ OpenAI API 엔드포인트
app.post('/api/generate-story', async (req, res) => {
  try {
    const { basicInfo, scenario } = req.body;

    const prompt = `
다음은 사용자 정보를 기반으로 한 이야기 생성 요청입니다.
- 기본 정보: ${JSON.stringify(basicInfo)}
- 시나리오: ${JSON.stringify(scenario)}

이 정보를 바탕으로 짧은 이야기를 만들어주세요.
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API Error:', errorText);
      return res
        .status(response.status)
        .json({ error: 'OpenAI API 호출 실패', details: errorText });
    }

    const data = await response.json();
    const story = data.choices?.[0]?.message?.content || '이야기 생성 실패';

    res.json({ story });
  } catch (error) {
    console.error('API 호출 중 오류 발생:', error);
    res.status(500).json({ error: '서버 내부 오류', details: error.message });
  }
});

// ✅ 서버 실행
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
});
