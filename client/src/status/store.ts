import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

// 상태의 타입을 정의
interface NowChatState {
    roomId: number;
    setRoomId: (id: number) => void;
}

// zustand를 사용하여 상태 관리 스토어 생성
export const useChatStore = create<NowChatState>()(
    devtools(
        persist(
            (set) => ({
                roomId: 0,
                setRoomId: (id: number) => set({ roomId: id }),
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
