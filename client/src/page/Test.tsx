import { Button, Container } from "@mui/material";
import OpenAI from "openai";

export const Test = () => {
    const openai = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_KEY,
        dangerouslyAllowBrowser: true,
    });

    const btnFunc = async () => {
        console.log("test");
        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant. You must answer in Korean.",
                },
                {
                    role: "user",
                    content: "대한민국의 수도는 어디인가요?",
                },
                // {
                //     "role": "assistant",
                //     "content": "대한민국의 수도는 서울입니다.",
                // },
                {
                    role: "user",
                    content: "이전의 답변을 영어로 번역해 주세요.",
                },
                {
                    role: "user",
                    content: "영어로 말하라니까",
                },
            ],
            model: "gpt-4o-mini",
        });
        console.log(completion.choices);
        console.log(completion.usage);
        console.log(completion.choices[0].message.content);
    };

    return (
        <>
            <Container>
                <Button variant="contained" onClick={btnFunc}>
                    send
                </Button>
            </Container>
        </>
    );
};
