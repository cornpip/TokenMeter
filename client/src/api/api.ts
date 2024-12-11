import axios from "axios";

export interface createChatDto {
    time: string;
    message: string;
    sequence: number;
    is_answer: number;
    room_id: number;
}

const api = axios.create({
    baseURL: "http://localhost:4000",
});

export const getRooms = async () => {
    const { data } = await api.get("/rooms");
    return data;
};
export const getRoomsBefore = () => api.get("/rooms");

export const createRoom = (name: string) => api.post("/rooms", { name });
export const updateRoom = (id: number, name: string) => api.put(`/rooms/${id}`, { name });
export const deleteRoom = (id: number) => api.delete(`/rooms/${id}`);

export const getChats = async (roomId: number | undefined) => {
    const { data } = await api.get(`/rooms/${roomId}/chats`);
    return data;
};
export const getChatsBefore = (roomId: number) => api.get(`/rooms/${roomId}/chats`);

export const createChat = (chat: {
    time: string;
    message: string;
    sequence: number;
    is_answer: number;
    room_id: number;
}) => api.post("/chats", chat);
export const updateChat = (id: number, chat: { time: string; message: string; sequence: number; is_answer: number }) =>
    api.put(`/chats/${id}`, chat);
export const deleteChat = (id: number) => api.delete(`/chats/${id}`);
