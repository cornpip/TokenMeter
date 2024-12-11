import { Box, IconButton, InputAdornment, TextField } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createChat, createChatDto, createRoom } from "../api/api";
import { useParams } from "react-router-dom";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";

export const SubmitComponent = () => {
    const [message, setMessage] = useState("");
    const { roomId } = useParams<{ roomId: string }>();
    const safeRoomId = roomId ?? "0";
    const queryClient = useQueryClient();

    const createChatMutation = useMutation({
        mutationFn: (dto: createChatDto) => {
            return createChat(dto);
        },
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ["chats"] });
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
            console.log(roomId);
            if (safeRoomId === "0") {
                console.log("createRoom logic~");
                await createRoomMutation.mutateAsync("createRoom logic~");
            }

            return;

            const n_msgHistory = [...msgHistory];
            n_msgHistory.push({ role: "user", content: message });

            // 답변 시간 걸림, 나중에 stream api 사용하기
            // openAi api
            const completion = await openai.chat.completions.create({
                messages: n_msgHistory,
                model: "gpt-4o-mini",
            });

            // 질문(db)
            const dto: createChatDto = {
                time: new Date().toISOString(),
                room_id: roomId,
                message: message,
                is_answer: 0,
                sequence: data.length ? data[data.length - 1].sequence + 1 : 0,
            };
            createChatMutation.mutate(dto);

            const completionMsg = completion.choices[0].message;
            if (completionMsg.content) {
                n_msgHistory.push({ role: "system", content: completionMsg.content });

                // 질문 응답(db)
                const dto: createChatDto = {
                    time: new Date().toISOString(),
                    room_id: roomId,
                    message: completionMsg.content,
                    is_answer: 1,
                    sequence: data.length ? data[data.length - 1].sequence + 2 : 1,
                };
                createChatMutation.mutate(dto);
            }

            setMsgHistory(n_msgHistory);
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
