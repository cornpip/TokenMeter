import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { ChatEntity } from "../interface/entity";

// 상태의 타입을 정의
interface NowChatState {
    msgHistory: ChatCompletionMessageParam[];
    chatData: ChatEntity[];

    setMsgHistory: (msgHistory: ChatCompletionMessageParam[]) => void;
    setChatData: (chatData: ChatEntity[]) => void;
}

// zustand를 사용하여 상태 관리 스토어 생성
export const useChatStore = create<NowChatState>()(
    devtools(
        persist(
            (set) => ({
                msgHistory: [],
                chatData: [],

                setMsgHistory: (msgHistory: ChatCompletionMessageParam[]) => set({ msgHistory }),
                setChatData: (chatData: ChatEntity[]) => set({ chatData }),
            }),
            {
                name: "chatId-storage",
            }
        )
    )
);

interface ApiKeyStore {
    apiKey: string;
    setApiKey: (key: string) => void;
}

export const useApiKeyStore = create<ApiKeyStore>((set) => ({
    apiKey: "",
    setApiKey: (key: string) => set({ apiKey: key }),
}));
