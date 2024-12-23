import { Box, IconButton, InputAdornment, TextField } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createChat, createChatDto, createRoom, getAllConfig } from "../api/api";
import { useNavigate, useParams } from "react-router-dom";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";
import { useChatStore } from "../status/store";
import OpenAI from "openai";
import { ConfigEntity } from "../interface/entity";

const getTitle = (msg: string): string => {
    const max_length: number = 15;
    return msg.length > max_length ? msg.slice(0, max_length) : msg;
};

export const SubmitComponent = () => {
    const [message, setMessage] = useState("");
    const { roomId } = useParams<{ roomId: string }>();
    let safeRoomId = roomId ?? "0";
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const chatData = useChatStore((state) => state.chatData);
    const msgHistory = useChatStore((state) => state.msgHistory);
    const [openai, setOpenai] = useState<OpenAI>();

    const { isPending, error, data, isSuccess } = useQuery<ConfigEntity[]>({
        queryKey: ["configs"],
        queryFn: async () => {
            const data = await getAllConfig();
            if (data.length > 0) {
                const apiKey = data[data.length - 1].openai_api_key;
                if (apiKey) {
                    setOpenai(
                        () =>
                            new OpenAI({
                                apiKey,
                                dangerouslyAllowBrowser: true,
                            })
                    );
                } else {
                    setOpenai(undefined);
                }
            } else {
                setOpenai(undefined);
            }
            return data;
        },
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

    const handleKeyDown = async (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    };

    const handleSendMessage = async () => {
        if (message.trim() && openai) {
            // 채팅 시작이면 방 만들고 navigate
            if (safeRoomId === "0") {
                await createRoomMutation.mutateAsync(getTitle(message)).then((res) => {
                    safeRoomId = res.data.id;
                    navigate(`./${safeRoomId}`);
                });
            }

            const n_msgHistory = [...msgHistory];
            n_msgHistory.push({ role: "user", content: message });

            /**
             * length - msgHistory 지표로도 가능할 듯, 근데 어차피 chatData render에 사용하니까
             * 비동기 타이밍 문제 있을 수 있으니까 질문/답변은 seq, seq+1로 잡아두기
             *
             * 질문 요청 중인 거 있으면 다른 질문 막아두는게?
             */
            const n_seq = chatData.length ? chatData[chatData.length - 1].sequence + 1 : 0;
            // 질문 요청(db)
            const dto: createChatDto = {
                time: new Date().toISOString(),
                room_id: parseInt(safeRoomId),
                message: message,
                is_answer: 0,
                sequence: n_seq,
            };
            createChatMutation.mutate(dto);

            /*
            openAi api
            답변 시간 걸림, 나중에 stream api 사용하기
            */
            try {
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
                        sequence: n_seq === 0 ? 1 : n_seq + 1,
                    };
                    createChatMutation.mutate(dto);
                }
                setMessage(""); // Clear the input after sending
            } catch (error: any) {
                alert(error);
            }
        } else if (!openai) {
            alert("Please register the API key first");
        }
    };

    if (isPending) return <Box>'Loading...'</Box>;
    if (error) return <Box> {`An error has occurred: ${error.message}`}</Box>;
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
                maxRows={safeRoomId !== "0" ? 8 : 20}
                placeholder="메시지 입력"
                variant="outlined"
                sx={{
                    "& .MuiOutlinedInput-root": {
                        padding: "10px",
                        backgroundColor: "#f5f5f5",
                    },
                }}
                onChange={(e) => setMessage(e.target.value)}
                value={message}
                onKeyDown={handleKeyDown}
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
