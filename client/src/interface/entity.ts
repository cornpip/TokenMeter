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
    msg_history: string;
    token_meter_prompt: number;
    token_meter_completion: number;
    token_meter_total: number;
    used_model: string;
}

export interface ConfigEntity {
    id: number;
    openai_api_key: string;
    selected_model: string;
    max_message: number;
    system_message: string;
}
