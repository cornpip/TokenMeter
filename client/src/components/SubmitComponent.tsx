import { Alert, Box, IconButton, InputAdornment, Snackbar, styled, TextField } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createChat, createRoom, getAllConfig, updateChat } from "../api/api";
import { useNavigate, useParams } from "react-router-dom";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";
import { useChatStore } from "../status/store";
import OpenAI from "openai";
import { ConfigEntity } from "../interface/entity";
import { ChatCompletionContentPart } from "openai/resources/index.mjs";
import { ChatCompletionMessageParam } from "openai/src/resources/index.js";
import { ChatCreateDto, ChatUpdateDto } from "../interface/dto";

const getTitle = (msg: string): string => {
    const max_length: number = 15;
    return msg.length > max_length ? msg.slice(0, max_length) : msg;
};

interface UploadedFile {
    id: number;
    name: string;
    preview: string;
    base64: string;
}

const ImagePreviewList = styled(Box)({
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    position: "absolute",
    top: "-90px", // TextField 위의 공간에 배치
    width: "100%",
    zIndex: 1,
});

const ImagePreviewItem = styled(Box)({
    position: "relative",
    width: "70px",
    height: "70px",
    borderRadius: "8px",
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
});

const RemoveButton = styled("button")({
    position: "absolute",
    top: "5px",
    right: "5px",
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    border: "none",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    color: "white",
    fontSize: "12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "&:hover": {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
    },
});

const ImagePreview = styled("img")({
    width: "100%",
    height: "100%",
    objectFit: "cover",
});

export const SubmitComponent = () => {
    const [message, setMessage] = useState("");
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [alertOpen, setAlertOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const { roomId } = useParams<{ roomId: string }>();
    let safeRoomId = roomId ?? "0";
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const chatData = useChatStore((state) => state.chatData);
    const msgHistory = useChatStore((state) => state.msgHistory);
    const [config, setConfig] = useState<ConfigEntity>({
        id: -1,
        openai_api_key: "",
        selected_model: "",
        max_message: -1,
    });
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
                setConfig(data[data.length - 1]);
            } else {
                setOpenai(undefined);
            }
            return data;
        },
    });

    const createChatMutation = useMutation({
        mutationFn: (dto: ChatCreateDto) => {
            return createChat(dto);
        },
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ["chats", safeRoomId] });
        },
    });

    const updateChatMutation = useMutation({
        mutationFn: (dto: ChatUpdateDto) => {
            return updateChat(dto);
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

    const handleClickSend = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        handleSendMessage();
    };

    const handleAttachFileClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click(); // 숨겨진 input[type="file"] 호출
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files) return;
        // console.log(files);

        const fileArray = Array.from(event.target.files);

        fileArray.forEach((file, index) => {
            if (!file.type.startsWith("image/")) {
                setAlertOpen(true);
                return;
            }
            const reader = new FileReader();

            reader.onload = () => {
                if (reader.result) {
                    const base64 = reader.result.toString();
                    const newFile: UploadedFile = {
                        id: files.length + index,
                        name: file.name,
                        preview: URL.createObjectURL(file),
                        base64: base64,
                    };

                    setFiles((prevFiles) => [...prevFiles, newFile]);
                }
            };

            reader.readAsDataURL(file); // 파일 Base64 변환
        });
    };

    const handleRemoveFile = (id: number) => {
        setFiles((prevFiles) => prevFiles.filter((file) => file.id !== id));
    };

    const handleSendMessage = async () => {
        if (message.trim() && openai) {
            let n_msgHistory: ChatCompletionMessageParam[] = [];
            // 보내는 거 포함해서 maximum_message_count
            if (config.max_message > 1) {
                n_msgHistory = [...msgHistory.slice(-1 * (config.max_message - 1))];
            }

            /**
             * 채팅 시작이면 초기화 -> 방 만들고 -> navigate
             * setMsgHistory timming = when "chats" usequery running
             * 귀찮으니까 앞에서는 그냥 비우고 뒤에서 맞도록
             */
            if (safeRoomId === "0") {
                n_msgHistory = [];
                await createRoomMutation.mutateAsync(getTitle(message)).then((res) => {
                    safeRoomId = res.data.id;
                    navigate(`./${safeRoomId}`);
                });
            }

            if (files.length > 0) {
                const n_content: ChatCompletionContentPart[] = [];
                n_content.push({ type: "text", text: message });

                files.forEach((v, i) => {
                    n_content.push({ type: "image_url", image_url: { url: v.base64 } });
                });

                n_msgHistory.push({ role: "user", content: n_content });
                setFiles([]);
            } else {
                n_msgHistory.push({ role: "user", content: message });
            }

            /**
             * length - msgHistory 지표로도 가능할 듯, 근데 어차피 chatData render에 사용하니까
             * 비동기 타이밍 문제 있을 수 있으니까 질문/답변은 seq, seq+1로 잡아두기
             *
             * 질문 요청 중인 거 있으면 다른 질문 막아두는게?
             */
            const n_seq = chatData.length ? chatData[chatData.length - 1].sequence + 1 : 0;
            // 질문 요청(db)
            const db_question: ChatCreateDto = {
                time: new Date().toISOString(),
                room_id: parseInt(safeRoomId),
                message: message,
                is_answer: 0,
                sequence: n_seq,
                used_model: config.selected_model,
            };
            const db_question_res_data: { id: number } = (await createChatMutation.mutateAsync(db_question)).data;

            /*
            openAi api
            답변 시간 걸림, 나중에 stream api 사용하기
            */
            try {
                const completion = await openai.chat.completions.create({
                    messages: n_msgHistory,
                    model: config.selected_model,
                });
                // console.log(completion);

                const completionMsg = completion.choices[0].message;
                if (completionMsg.content) {
                    n_msgHistory.push({ role: "system", content: completionMsg.content });

                    // 질문 응답(db)
                    const db_answer: ChatCreateDto = {
                        time: new Date().toISOString(),
                        room_id: parseInt(safeRoomId),
                        message: completionMsg.content,
                        is_answer: 1,
                        sequence: n_seq === 0 ? 1 : n_seq + 1,
                        used_model: config.selected_model,
                        msg_history: JSON.stringify(n_msgHistory, null, 4),
                        token_meter_prompt: completion.usage?.prompt_tokens,
                        token_meter_completion: completion.usage?.completion_tokens,
                        token_meter_total: completion.usage?.total_tokens,
                    };
                    createChatMutation.mutate(db_answer);

                    if (db_question_res_data.id) {
                        updateChatMutation.mutate({
                            chatId: db_question_res_data.id,
                            msg_history: JSON.stringify(n_msgHistory, null, 4),
                            token_meter_prompt: completion.usage?.prompt_tokens,
                            token_meter_completion: completion.usage?.completion_tokens,
                            token_meter_total: completion.usage?.total_tokens,
                        });
                    }
                }
                setMessage(""); // Clear the input after sending
            } catch (error: any) {
                alert(error);
            }
        } else if (!openai) {
            alert("Please register the API key first");
            navigate("/config");
        }
    };

    if (isPending) return <Box>'Loading...'</Box>;
    if (error) return <Box> {`An error has occurred: ${error.message}`}</Box>;
    return (
        <Box
            sx={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                alignItems: "center",
                width: "100%",
                borderRadius: "20px",
                backgroundColor: "white",
            }}
        >
            {files.length > 0 && (
                <ImagePreviewList>
                    {files.map((file) => (
                        <ImagePreviewItem key={file.id}>
                            <ImagePreview src={file.preview} alt={file.name} />
                            <RemoveButton onClick={() => handleRemoveFile(file.id)}>×</RemoveButton>
                        </ImagePreviewItem>
                    ))}
                </ImagePreviewList>
            )}
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
                                <IconButton onClick={handleAttachFileClick}>
                                    <AttachFileIcon />
                                </IconButton>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    style={{ display: "none" }}
                                    accept="image/*" // 이미지 형식만 허용
                                    multiple // 다중 파일 업로드 가능
                                    onChange={handleFileChange}
                                />
                            </InputAdornment>
                        ),
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={handleClickSend}>
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
            <Snackbar open={alertOpen} autoHideDuration={3000} onClose={() => setAlertOpen(false)}>
                <Alert severity="error" onClose={() => setAlertOpen(false)}>
                    Unsupported file format. Please upload only images
                </Alert>
            </Snackbar>
        </Box>
    );
};
