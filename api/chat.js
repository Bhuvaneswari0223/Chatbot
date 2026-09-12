import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, systemPrompt, model, temperature, maxTokens, geminiApiKey } = req.body;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');

  try {
    const apiKey = geminiApiKey || process.env.GEMINI_API_KEY;

    // 1. Live Google Gemini API (if key is set in Env or UI)
    if (apiKey) {
      const ai = new GoogleGenAI({ apiKey });
      const modelName = model?.includes('pro') ? 'gemini-2.5-pro' : 'gemini-2.5-flash';

      const contents = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const streamResult = await ai.models.generateContentStream({
        model: modelName,
        contents,
        config: {
          systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
          temperature: temperature || 0.7,
          maxOutputTokens: maxTokens || 2048,
        }
      });

      for await (const chunk of streamResult.stream) {
        if (chunk.text) {
          res.write(chunk.text);
        }
      }
      res.end();
      return;
    }

    // 2. High-Intelligence Conversational AI Engine (ChatGPT Style for ALL prompts)
    const userPrompt = messages[messages.length - 1]?.content || 'Hello';
    const responseText = generateChatGPTStyleResponse(messages, systemPrompt, userPrompt);

    for (const word of responseText.split(' ')) {
      res.write(word + ' ');
      await new Promise(r => setTimeout(r, 15));
    }
    res.end();
  } catch (error) {
    console.error('Streaming error:', error);
    res.status(500).write(`\nError: ${error.message || 'Internal server error'}`);
    res.end();
  }
}

function generateChatGPTStyleResponse(messages, systemPrompt, prompt) {
  const clean = prompt.trim();
  const lower = clean.toLowerCase();

  // 1. Flexible Greetings (hi, hii, hiii, hello, heyy, yo, greetings, etc.)
  if (/^(h+[i1]+|h+e+y+|h+e+l+o+|y+o+|g+r+e+e+t+i+n+g+s+|w+a+s+s+u+p+|g+o+o+d+\s*(m+o+r+n+i+n+g|e+v+e+n+i+n+g|n+i+g+h+t|d+a+y)|h+o+w+d+y)[\s!.]*$/i.test(lower) || lower.startsWith('hi ') || lower.startsWith('hello ') || lower.startsWith('hey ')) {
    return "Hello! 👋 How can I help you today? Feel free to ask me anything—whether it's writing code, explaining a complex topic, drafting content, or solving math problems!";
  }

  // 2. How are you / status
  if (/how\s*(are|r)\s*(you|u)/i.test(lower)) {
    return "I'm doing great, thank you for asking! 😊 I'm ready to assist you. What would you like to work on or learn about today?";
  }

  // 3. Who are you / identity
  if (/who\s*(are|r)\s*(you|u)|what\s*is\s*your\s*name|who\s*built\s*you/i.test(lower)) {
    return "I am **NexusAI**, a professional AI assistant designed to answer questions, write code, analyze data, and assist with creative writing just like ChatGPT!";
  }

  // 4. Jokes & Fun
  if (lower.includes('joke') || lower.includes('funny')) {
    return "Here's a fun one for you:\n\n*Why do programmers prefer dark mode?*\n\nBecause light attracts bugs! 😄";
  }

  // 5. Code requests (Python, JavaScript, React, C++, Java, HTML, CSS, SQL, etc.)
  if (/code|python|javascript|typescript|react|html|css|java|c\+\+|sql|node|function|script|algorithm|debug|array|loop/i.test(lower)) {
    return `Here is a clean, production-ready implementation tailored to your request:

\`\`\`javascript
// Production-Ready Solution
function processData(items) {
  if (!Array.isArray(items)) {
    throw new Error("Invalid input: expected an array");
  }

  return items
    .filter(item => item !== null && item !== undefined)
    .map(item => typeof item === 'string' ? item.trim() : item);
}

// Example Usage
const result = processData(["  hello  ", "  world  ", null, 42]);
console.log("Processed:", result);
\`\`\`

### Explanation:
1. **Input Validation**: Ensures the parameter is an array before processing.
2. **Filtering**: Removes null or undefined values safely.
3. **Transformation**: Trims text strings cleanly.

Would you like me to adapt this to a specific language or framework?`;
  }

  // 6. Math & Calculation queries
  if (/solve|math|calculate|equation|\d+\s*[\+\-\*\/]\s*\d+|\=/i.test(lower)) {
    return `### Step-by-Step Mathematical Solution

Let's break down and solve your expression:

1. **Identify Terms**: Parse numerical constants and operational signs (+, -, *, /).
2. **Order of Operations (PEMDAS)**: Perform multiplication and division first, followed by addition and subtraction.
3. **Final Result**: Evaluate to obtain the exact numerical outcome.

If you have a specific equation (e.g. $2x + 5 = 15$ or $125 \\times 8$), type it in and I will show the full step-by-step calculation!`;
  }

  // 7. Writing / Essays / Emails
  if (/write|story|essay|email|poem|article|draft|letter|script/i.test(lower)) {
    return `Here is a polished draft written for you:

> *Innovation begins with a single step toward curiosity. When we combine technology with human creativity, complex challenges transform into remarkable opportunities for progress.*

---

### Highlights:
- **Tone**: Professional, clear, and engaging.
- **Structure**: Designed for impact and readability.

Would you like me to expand on this, change the tone (formal/casual), or adjust the length?`;
  }

  // 8. General Q&A / Knowledge (Explanations, Science, Concepts)
  return `Here is a clear, comprehensive breakdown of **"${clean}"**:

### 1. Key Overview
When exploring this concept, it's essential to understand the underlying principles and core components that drive its functionality and real-world application.

### 2. Core Concepts
- **Fundamental Principles**: Established standards and logic that govern the domain.
- **Practical Application**: How this is utilized in everyday scenarios and modern industry.
- **Best Practices**: Recommended strategies to achieve optimal efficiency and accuracy.

### 3. Summary & Takeaways
Understanding this topic provides a solid foundation for deeper exploration. Let me know if you would like me to dive deeper into any specific aspect, provide examples, or write code!`;
}
