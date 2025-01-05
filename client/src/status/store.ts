import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { create } from "zustand";
import { ChatEntity, ConfigEntity } from "../interface/entity";

// 상태의 타입을 정의
interface NowChatState {
    msgHistory: ChatCompletionMessageParam[];
    chatData: ChatEntity[];

    setMsgHistory: (msgHistory: ChatCompletionMessageParam[]) => void;
    setChatData: (chatData: ChatEntity[]) => void;
}

// zustand를 사용하여 상태 관리 스토어 생성
export const useChatStore = create<NowChatState>((set) => ({
    msgHistory: [],
    chatData: [],

    setMsgHistory: (msgHistory: ChatCompletionMessageParam[]) => set({ msgHistory }),
    setChatData: (chatData: ChatEntity[]) => set({ chatData }),
}));

interface LeftCompOpenStore {
    isOpen: boolean;
    setIsOpen: (flag: boolean) => void;
}

export const useLeftCompOpenStore = create<LeftCompOpenStore>((set) => ({
    isOpen: true,
    setIsOpen: (flag: boolean) => set({ isOpen: flag }),
}));

// interface ConfigStore {
//     configEntity: ConfigEntity;
//     setConfigEntity: (c: ConfigEntity) => void;
// }

// export const useConfigStore = create<ConfigStore>((set) => ({
//     configEntity: { id: 0, openai_api_key: "", selected_model: "" },
//     setConfigEntity: (c: ConfigEntity) => set({ configEntity: c }),
// }));

// deprecated
interface ApiKeyStore {
    apiKey: string;
    setApiKey: (key: string) => void;
}

export const useApiKeyStore = create<ApiKeyStore>((set) => ({
    apiKey: "",
    setApiKey: (key: string) => set({ apiKey: key }),
}));
