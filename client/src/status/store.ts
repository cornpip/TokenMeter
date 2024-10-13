import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// 상태의 타입을 정의
interface nowChatState {
    id: number;
    setId: (id: number) => void;
}

// zustand를 사용하여 상태 관리 스토어 생성
export const useChatStore = create<nowChatState>()(
    devtools(
        persist(
            (set) => ({
                id: 0,
                setId: (id: number) => set({ id }),
            }),
            {
                name: 'chatId-storage',
            }
        )
    )
);

interface ApiKeyStore {
    apiKey: string;
    setApiKey: (key: string) => void;
}

export const useApiKeyStore = create<ApiKeyStore>((set) => ({
    apiKey: '',
    setApiKey: (key: string) => set({ apiKey: key }),
}));
