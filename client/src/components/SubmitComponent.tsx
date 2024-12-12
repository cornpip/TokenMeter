import { Box, IconButton, InputAdornment, TextField } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createChat, createChatDto, createRoom } from "../api/api";
import { useNavigate, useParams } from "react-router-dom";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";
import { useChatStore } from "../status/store";
import OpenAI from "openai";

export const SubmitComponent = () => {
    const [message, setMessage] = useState("");
    const { roomId } = useParams<{ roomId: string }>();
    let safeRoomId = roomId ?? "0";
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const chatData = useChatStore((state) => state.chatData);
    const msgHistory = useChatStore((state) => state.msgHistory);
    const setRoomId = useChatStore((state) => state.setRoomId);
    const setMsgHistory = useChatStore((state) => state.setMsgHistory);

    const openai = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_KEY,
        dangerouslyAllowBrowser: true,
    });

    const createChatMutation = useMutation({
        mutationFn: (dto: createChatDto) => {
            return createChat(dto);
        },
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ["chats", safeRoomId] });
        },
    });

    const createRoomMutation = useMutation({
        mutationFn: (roomName: string) => {
            return createRoom(roomName);
        },
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ["rooms"] });
        },
    });

    const handleKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            const target = event.target as HTMLInputElement;
            if (event.shiftKey) {
                // Shift + Enter adds a new line
                event.preventDefault();

                const start = target.selectionStart || 0;
                const end = target.selectionEnd || 0;
                const newMessage = message.substring(0, start) + "\n" + message.substring(end);
                setMessage(newMessage);

                // Move the cursor to the position after the new line
                requestAnimationFrame(() => {
                    target.selectionStart = target.selectionEnd = start + 1;
                });
            } else {
                // Enter sends the message (implement your send logic here)
                event.preventDefault();
                handleSendMessage();
            }
        }
    };

    const handleSendMessage = async () => {
        if (message.trim()) {
            // 채팅 시작이면 방 만들고 navigate
            if (safeRoomId === "0") {
                await createRoomMutation.mutateAsync("createRoom logic~").then((res) => {
                    safeRoomId = res.data.id;
                    navigate(`./${safeRoomId}`);
                });
            }

            const n_msgHistory = [...msgHistory];
            n_msgHistory.push({ role: "user", content: message });

            // 질문 요청(db)
            const dto: createChatDto = {
                time: new Date().toISOString(),
                room_id: parseInt(safeRoomId),
                message: message,
                is_answer: 0,
                sequence: chatData.length ? chatData[chatData.length - 1].sequence + 1 : 0,
            };
            createChatMutation.mutate(dto);
            // 그럼 chatData는 mutate될 때마다 set이 되야하는거네? 일단 동기 맞추기 귀찮으니까 아래는 동기무관하게 작성

            /*
            openAi api
            답변 시간 걸림, 나중에 stream api 사용하기
            */
            const completion = await openai.chat.completions.create({
                messages: n_msgHistory,
                model: "gpt-4o-mini",
            });

            const completionMsg = completion.choices[0].message;
            if (completionMsg.content) {
                n_msgHistory.push({ role: "system", content: completionMsg.content });

                // 질문 응답(db)
                const dto: createChatDto = {
                    time: new Date().toISOString(),
                    room_id: parseInt(safeRoomId),
                    message: completionMsg.content,
                    is_answer: 1,
                    sequence: chatData.length ? chatData[chatData.length - 1].sequence + 1 : 1,
                };
                createChatMutation.mutate(dto);
            }
            setMessage(""); // Clear the input after sending
        }
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                alignItems: "center",
                width: "100%",
                borderRadius: "20px",
                backgroundColor: "white",
            }}
        >
            <TextField
                fullWidth
                multiline
                maxRows={safeRoomId !== "0" ? 4 : 15}
                placeholder="메시지 입력"
                variant="outlined"
                sx={{
                    "& .MuiOutlinedInput-root": {
                        padding: "10px",
                        backgroundColor: "#f5f5f5",
                    },
                }}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                value={message}
                // onKeyDown={handleKeyDown}
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <IconButton>
                                    <AttachFileIcon />
                                </IconButton>
                            </InputAdornment>
                        ),
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={() => {}}>
                                    <SendIcon />
                                </IconButton>
                            </InputAdornment>
                        ),
                        sx: {
                            paddingRight: "50px",
                            borderRadius: "20px",
                        },
                    },
                }}
            />
        </Box>
    );
};
