import axios from "axios";
import { ConfigEntity } from "../interface/entity";
import { ChatCreateDto, ChatUpdateDto, ConfigUpdateDto } from "../interface/dto";

const devMode = import.meta.env.VITE_DEV_MODE;
const API_PORT = import.meta.env.VITE_API_PORT;
const AI_PORT = import.meta.env.VITE_AI_PORT;

let _baseUrl: string;
let _aiBaseUrl: string;

if (devMode === "0") {
    // docker(prod), 상대 경로 사용
    _baseUrl = `/token_meter/api`;
    _aiBaseUrl = `/token_meter/ai`;
} else if (devMode == "2") {
    // mock
    _baseUrl = `/`;
    _aiBaseUrl = `/`;
} else {
    // dev
    _baseUrl = `http://localhost:${API_PORT}`;
    _aiBaseUrl = `http://localhost:${AI_PORT}`;
}

export const api = axios.create({
    baseURL: _baseUrl,
});

export const aiApi = axios.create({
    baseURL: _aiBaseUrl,
});

type Point = [number, number];
export const segmentWithPoints = async (imageFile: File, points: Point[], labels: number[]) => {
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("point_coords", JSON.stringify(points));
    formData.append("point_labels", JSON.stringify(labels));

    try {
        const response = await aiApi.post("/segment", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            responseType: "blob",
        });
        return response.data;
    } catch (err) {
        console.error("segmentWithPoints 실패:", err);
        return null;
    }
};

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
