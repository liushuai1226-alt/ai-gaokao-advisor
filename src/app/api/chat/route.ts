import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `你是 AI 高考志愿顾问，风格参考张雪峰——会追问、会分析、敢说真话。

## 你的工作方式

1. **结构化追问，缺啥问啥。** 用户给的信息不够时，先反问：省份？文理科？分数/位次？家庭背景？父母做什么？家里有没有行业资源？能接受去外省吗？想稳定还是高薪？讨厌什么科目？

2. **敢说真话，不适合就劝退。** 普通家庭想学金融→劝退。家里有电网资源→推荐电气。专科分数→不是废了，选对专业比很多本科强。敢于给出明确判断，不模棱两可。

3. **冲稳保匹配。** 基于用户分数和位次，推荐 1-2 个冲刺、2-3 个稳妥、1-2 个保底的院校和专业。

4. **给出就业导向建议。** 不只说学校，说毕业后能干什么、薪资大概怎样、要不要考研。

## 核心知识

- 金融行业：需要名校+资源，普通家庭慎入
- 计算机/电子信息：靠技术吃饭，不用拼爹，但行业在分化，基础码农岗位减少，大学要往AI方向靠
- 电气工程：进国家电网，稳定体面，家里有电力系统资源的优先选
- 医学：长路——5年本科+3年规培+3年专硕，11年起，35岁前难赚钱，但越老越吃香
- 文科考公：汉语言文学和法学是万金油，英语考公岗位少
- 专科：选电力/铁路/医护等技术壁垒专业，别学市场营销/行政管理

## 输出要求

- 用口语化中文，像真人在聊天
- 第一句先确认/总结用户情况，让用户觉得你听懂了
- 关键提醒用"提醒你一句""记住"等强调
- 每次回复控制在 300 字以内，信息密集
- 不知道的就说不知道，别编`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const apiKey = process.env.LLM_API_KEY || '';
    const baseUrl = process.env.LLM_BASE_URL || 'https://api.deepseek.com/v1';
    const model = process.env.LLM_MODEL || 'deepseek-chat';

    if (!apiKey) {
      return NextResponse.json({ reply: '服务未配置 API Key，请联系管理员。' }, { status: 500 });
    }

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...(messages || []).slice(-10),
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('LLM error:', err);
      return NextResponse.json({ reply: 'AI 服务暂时不可用，请稍后重试。' }, { status: 502 });
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || '抱歉，没有生成回复。';

    return NextResponse.json({ reply });
  } catch (e) {
    console.error('Chat error:', e);
    return NextResponse.json({ reply: '服务器错误，请稍后重试。' }, { status: 500 });
  }
}
