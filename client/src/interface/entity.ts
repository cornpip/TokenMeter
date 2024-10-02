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
