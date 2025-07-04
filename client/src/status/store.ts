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

//modal
interface TokenMeterModalStore {
    open: boolean;
    content?: ChatEntity;
    setOpen: (isOpen: boolean, content?: ChatEntity) => void;
}

export const useTokenMeterModalStore = create<TokenMeterModalStore>((set) => ({
    open: false,
    content: undefined,
    setOpen: (isOpen: boolean, content?: ChatEntity) => set({ open: isOpen, content }),
}));

interface ConfigStore {
    config: ConfigEntity;
    setConfig: (newConfig: Partial<ConfigEntity>) => void;
    resetConfig: () => void;
}

export const useConfigStore = create<ConfigStore>((set) => ({
    config: {
        id: -1,
        openai_api_key: "",
        selected_model: "",
        max_message: -1,
        system_message: "",
    },
    setConfig: (newConfig) =>
        set((state) => ({
            config: { ...state.config, ...newConfig },
        })),
    resetConfig: () =>
        set({
            config: {
                id: -1,
                openai_api_key: "",
                selected_model: "",
                max_message: -1,
                system_message: "",
            },
        }),
}));
