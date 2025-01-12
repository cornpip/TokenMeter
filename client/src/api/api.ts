import axios from "axios";
import { ConfigEntity } from "../interface/entity";
import { ChatCreateDto, ChatUpdateDto, ConfigUpdateDto } from "../interface/dto";

export const api = axios.create({
    baseURL: "http://localhost:4000",
});

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

export const updateConfigById = async (dto: ConfigUpdateDto) => {
    const { data } = await api.put(`/configs/${dto.id}`, dto);
    return data;
};
