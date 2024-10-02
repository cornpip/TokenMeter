// 가장 작은 단위 chat
export interface Chat {
    time: Date;
    sequence: number;
    text: string;
    isQuestion: boolean;
    isAnswer: boolean;
}

// 열린 하나의 대화에서 chat을 모아둔 chatHistory
export interface ChatHistory {
    startedAt: Date;
    chatList: Chat[];
}
