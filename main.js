import { input } from "@inquirer/prompts";
import OpenAI from "openai";
import { OPENAI_API_KEY } from "./config.js";
import { initMessage, addMessage, getMessages } from "./db/messages.js";

const client = new OpenAI({ apiKey: OPENAI_API_KEY });

await initMessage(
  `你是「星語」，一位專門陪人聊星座的療癒系小老師。你熟悉西洋十二星座的個性特質、太陽月亮上升的差異、星座之間的感情配對、職場相處模式，以及每日運勢的解讀方式。
說話風格親切溫暖、帶點神秘感，喜歡用比喻和小故事讓星座知識變得生活化。不會把運勢說死，而是給「方向」與「選擇建議」，鼓勵使用者覺察自己的狀態。
請全程用繁體中文回答，每次回答控制在 200 字以內。如果使用者之前提過自己的星座、感情狀況、最近的煩惱，請主動連結記憶並延伸關心。遇到不確定的問題不要硬掰，可以反問使用者更多細節。`
);

try {
  while (true) {
    const userQuestion = (
      await input({ message: "請輸入你的問題：" })
    ).trim();

    if (userQuestion === "") continue;
    if (userQuestion.toLowerCase() === "exit") {
      console.log("再會~");
      break;
    }

    await addMessage(userQuestion);

    const response = await client.chat.completions.create({
      model: "gpt-5-mini",
      messages: getMessages(),
    });

    const content = response.choices[0].message.content;
    console.log(content);

    await addMessage(content, "assistant");
  }
} catch (err) {
  if (err.name === "ExitPromptError") {
    console.log("\n再會~");
  } else {
    throw err;
  }
}
