export interface RoomEntity {
    id: number;
    name: string;
}

export interface ChatEntity {
    id: number;
    time: string;
    message: string;
    sequence: number;
    is_answer: number;
    room_id: number;
}

export interface ConfigEntity {
    id: number;
    openai_api_key: string;
    selected_model: string;
}
