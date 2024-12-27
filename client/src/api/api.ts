import axios from "axios";
import { ConfigEntity } from "../interface/entity";

export interface createChatDto {
    time: string;
    sequence: number;
    message: string;
    is_answer: number;
    room_id: number;
}

export interface updateConfigDto {
    id: number;
    openai_api_key: string;
}

export const api = axios.create({
    baseURL: "http://localhost:4000",
});

// test에서 썼음
export const getRoomsBefore = () => api.get("/rooms");

export const getRoomById = async (id: string) => {
    const { data } = await api.get(`/rooms/${id}`);
    return data;
};
export const getRooms = async () => {
    const { data } = await api.get("/rooms");
    return data;
};
export const createRoom = (name: string) => api.post("/rooms", { name });
export const updateRoom = (id: number, name: string) => api.put(`/rooms/${id}`, { name });
export const deleteRoom = (id: number) => api.delete(`/rooms/${id}`);

export const getChatsbyRoomId = async (roomId: number | undefined) => {
    const { data } = await api.get(`/chats/room/${roomId}`);
    return data;
};

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

// config
export const getAllConfig = async () => {
    const { data } = await api.get<ConfigEntity[]>(`/configs/all`);
    return data;
};

export const updateConfigById = async (dto: updateConfigDto) => {
    const { data } = await api.put(`/configs/${dto.id}`, dto);
    return data;
};
