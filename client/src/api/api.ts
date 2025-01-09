import axios from "axios";
import { ConfigEntity } from "../interface/entity";
import { ChatCreateDto, ChatUpdateDto } from "../interface/dto";

export interface updateConfigDto {
    id: number;
    openai_api_key?: string;
    selected_model?: string;
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
export const createChat = (chat: ChatCreateDto) => api.post("/chats", chat);
export const updateChat = (dto: ChatUpdateDto) => api.put(`/chats/${dto.chatId}`, dto);
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
