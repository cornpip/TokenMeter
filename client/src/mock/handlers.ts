import { http, HttpResponse } from "msw";
import { ChatEntity, ConfigEntity, RoomEntity } from "../interface/entity";
import { ChatCreateDto, ChatUpdateDto, ConfigUpdateDto } from "../interface/dto";

let rooms: RoomEntity[] = [
    { id: 1, name: "Mock Room 1" },
];

let chats: ChatEntity[] = [
    {
        id: 1,
        time: "",
        message: "안녕하세요, 첫 번째 메시지입니다.",
        sequence: 1,
        is_answer: 0,
        room_id: 1,
        msg_history: `[
            {
                "role": "user",
                "content": "안녕하세요, 첫 번째 메시지입니다."
            },
            {
                "role": "assistant",
                "content": "두 번째 메시지입니다. 답변이에요."
            }
        ]`,
        token_meter_prompt: 15,
        token_meter_completion: 30,
        token_meter_total: 45,
        used_model: "gpt-4",
    },
    {
        id: 2,
        time: "",
        message: "두 번째 메시지입니다. 답변이에요.",
        sequence: 2,
        is_answer: 1,
        room_id: 1,
        msg_history: `[
            {
                "role": "user",
                "content": "안녕하세요, 첫 번째 메시지입니다."
            },
            {
                "role": "assistant",
                "content": "두 번째 메시지입니다. 답변이에요."
            }
        ]`,
        token_meter_prompt: 20,
        token_meter_completion: 25,
        token_meter_total: 45,
        used_model: "gpt-4",
    },
];

let configs: ConfigEntity[] = [
    {
        id: 1,
        openai_api_key: "mock-key",
        selected_model: "gpt-4",
        max_message: 5,
        system_message: '["ㅁㅁ","ㅈㅈㅈ"]',
    },
];

export const handlers = [
    // ========== ROOMS ==========
    http.get("/rooms", () => {
        return HttpResponse.json(rooms);
    }),

    http.get("/rooms/:id", ({ params }) => {
        const room = rooms.find((r) => r.id === Number(params.id));
        return room ? HttpResponse.json(room) : HttpResponse.json({ error: "Room not found" }, { status: 404 });
    }),

    http.post("/rooms", async ({ request }) => {
        const body = (await request.json()) as { name: string };
        const { name } = body;
        const newRoom: RoomEntity = { id: Date.now(), name };
        rooms.push(newRoom);
        return HttpResponse.json(newRoom, { status: 201 });
    }),

    http.put("/rooms/:id", async ({ request, params }) => {
        const body = (await request.json()) as { name: string };
        const { name } = body;
        const id = Number(params.id);
        rooms = rooms.map((r) => (r.id === id ? { ...r, name } : r));
        return HttpResponse.json({ success: true });
    }),

    http.delete("/rooms/:id", ({ params }) => {
        const id = Number(params.id);
        rooms = rooms.filter((r) => r.id !== id);
        return HttpResponse.json({ success: true });
    }),

    // ========== CHATS ==========
    http.get("/chats/room/:roomId", ({ params }) => {
        const roomId = Number(params.roomId);
        const roomChats = chats.filter((c) => c.room_id === roomId);
        return HttpResponse.json(roomChats);
    }),

    http.post("/chats", async ({ request }) => {
        const chat: ChatCreateDto = (await request.json()) as ChatCreateDto;
        const newId = chats.length > 0 ? chats[chats.length - 1].id + 1 : 1;
        const newChat: ChatEntity = {
            id: newId,
            ...chat,
            msg_history: chat.msg_history ?? "",
            token_meter_prompt: chat.token_meter_prompt ?? 0,
            token_meter_completion: chat.token_meter_completion ?? 0,
            token_meter_total: chat.token_meter_total ?? 0,
        };
        chats.push(newChat);
        return HttpResponse.json(newChat, { status: 201 });
    }),

    http.put("/chats/:chatId", async ({ request, params }) => {
        const chatId = Number(params.chatId);
        const updated: ChatUpdateDto = (await request.json()) as ChatUpdateDto;
        chats = chats.map((c) =>
            c.id === chatId
                ? {
                      ...c,
                      ...updated,
                      id: c.id, // id는 기존 값 유지
                  }
                : c
        );
        return HttpResponse.json({ success: true });
    }),

    http.delete("/chats/:chatId", ({ params }) => {
        const chatId = Number(params.chatId);
        chats = chats.filter((c) => c.id !== chatId);
        return HttpResponse.json({ success: true });
    }),

    // ========== CONFIG ==========
    http.get("/configs/all", () => {
        return HttpResponse.json(configs);
    }),

    http.put("/configs/:id", async ({ request, params }) => {
        const updated: ConfigUpdateDto = (await request.json()) as ConfigUpdateDto;
        const id = Number(params.id);
        configs = configs.map((conf) =>
            conf.id === id
                ? {
                      ...conf,
                      ...updated,
                      id: conf.id, // id는 기존 값 유지
                  }
                : conf
        );
        // 업데이트 된 config 반환 (최신 값)
        const updatedConfig = configs.find((conf) => conf.id === id);
        return HttpResponse.json(updatedConfig);
    }),
];
