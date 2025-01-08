export interface RoomDeleteResDto {
    deletedId: number;
}

export interface ChatCreateDto {
    time: string;
    message: string;
    sequence: number;
    is_answer: number;
    room_id: number;
    used_model: string;
    msg_history?: string;
    token_meter_prompt?: number;
    token_meter_completion?: number;
    token_meter_total?: number;
}

export interface ChatUpdateDto {
    chatId: number;
    time?: string;
    message?: string;
    sequence?: number;
    is_answer?: number;
    room_id?: number;
    used_model?: string;
    msg_history?: string;
    token_meter_prompt?: number;
    token_meter_completion?: number;
    token_meter_total?: number;
}
