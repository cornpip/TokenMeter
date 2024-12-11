import { Chat, ChatHistory } from "./data.const";

const now: Date = new Date();

const chatList: Chat[] = [];
for (let i = 0; i < 10; i++) {
    let t = new Date(now);
    t.setMinutes(now.getMinutes() + i);
    let c: Chat = {
        time: t,
        sequence: i,
        text: "a" + i.toString(),
        isAnswer: i % 2 == 0,
        isQuestion: i % 2 != 0,
    };
    chatList.push(c);
}

const chatHistoryList: ChatHistory[] = [];
for (let i = 0; i < 10; i++) {
    let t = new Date();
    let ch: ChatHistory = {
        startedAt: t,
        chatList: chatList,
    };
    chatHistoryList.push(ch);
}

export { chatHistoryList, chatList };
