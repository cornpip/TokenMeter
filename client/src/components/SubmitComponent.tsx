import { Alert, Box, IconButton, InputAdornment, Snackbar, styled, TextField, Typography } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { crawlAndSummary, createChat, createRoom, getAllConfig, updateChat } from "../api/api";
import { useNavigate, useParams } from "react-router-dom";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";
import { useChatStore, useConfigStore } from "../status/store";
import OpenAI from "openai";
import { ConfigEntity } from "../interface/entity";
import { ChatCompletionContentPart } from "openai/resources/index.mjs";
import { ChatCompletionMessageParam } from "openai/src/resources/index.js";
import { ChatCreateDto, ChatUpdateDto } from "../interface/dto";
import { CONFIG_URL } from "../constants/path.const";
import { parseStringList } from "../util/JsonUtil";
import { SummaryResponse } from "../api/api.interface";

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

// http:// https:// 로 시작해서
// 공백, 따옴표(' 또는 "), <, >**를 만나기 전까지의 문자열(길이 1 이상)을 전부 매칭
const extractUrls = (text: string): string[] => {
    const urlRegex = /(https?:\/\/[^\s'"<>]+)/g;
    const matches = text.match(urlRegex);
    return matches ? matches : [];
};

/**
 * 주어진 메시지에서 URL을 추출하고 각 URL에 대해 요약을 가져온 뒤,
 * 해당 URL 옆에 (crawling summary: ...) 형식으로 삽입하여 반환
 */
const crawlAndSummaryAndAppend = async (message: string): Promise<string> => {
    const urls = extractUrls(message);
    const summarizeList: (SummaryResponse & { url: string })[] = [];

    for (const url of urls) {
        const res: SummaryResponse | null = await crawlAndSummary(url);
        if (res) {
            summarizeList.push({ ...res, url });
        }
    }

    for (const { url, summary } of summarizeList) {
        const block = [url, "```text", "(...crawling summary...)", summary.trim(), "```", ""].join("\n");
        message = message.replaceAll(url, block);
    }

    return message;
};

export const SubmitComponent = () => {
    const [message, setMessage] = useState("");
    const [isDragOver, setIsDragOver] = useState(false);
    const [textFieldOff, setTextFieldOff] = useState<boolean>(false);
    const [isCrawlRunning, setIsCrawlRunning] = useState<boolean>(false);
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [alertOpen, setAlertOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const { roomId } = useParams<{ roomId: string }>();
    let safeRoomId = roomId ?? "0";
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const chatData = useChatStore((state) => state.chatData);
    const msgHistory = useChatStore((state) => state.msgHistory);
    const { config, setConfig, resetConfig } = useConfigStore();
    const [openai, setOpenai] = useState<OpenAI>();
    const inputRef = useRef<HTMLInputElement>(null);

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
            // console.log(variables.room_id);
            // 주의) invalidateQueries String 하고 number 구분됨
            queryClient.invalidateQueries({ queryKey: ["chats", String(variables.room_id)] });
        },
    });

    const updateChatMutation = useMutation({
        mutationFn: (dto: ChatUpdateDto) => {
            return updateChat(dto);
        },
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ["chats", String(variables.room_id)] });
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

    const _setFileArray = (fileArray: File[]) => {
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

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files) return;
        // console.log(files);

        const fileArray = Array.from(event.target.files);
        _setFileArray(fileArray);
    };

    const handleDropFileUpload = (droppedFiles: FileList) => {
        if (!droppedFiles || droppedFiles.length === 0) return;

        // FileList를 배열로 변환
        const fileArray = Array.from(droppedFiles);
        _setFileArray(fileArray);
    };

    const handleRemoveFile = (id: number) => {
        setFiles((prevFiles) => prevFiles.filter((file) => file.id !== id));
    };

    // 드래그 시작: 드래그 UI 활성화
    const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragOver(true);
    };

    // 드래그 중: 기본 동작 방지 & 드롭존 유지
    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragOver(true);
    };

    // 드래그 종료: UI 초기화
    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragOver(false);
    };

    // 드래그 앤 드롭 파일 처리
    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragOver(false); // 드롭 후 상태 초기화

        const droppedFiles = event.dataTransfer.files;
        if (droppedFiles && droppedFiles.length > 0) {
            // console.log(droppedFiles);
            handleDropFileUpload(droppedFiles); // 파일 처리 함수 실행
            event.dataTransfer.clearData();
        }
    };

    const handleSendMessage = async () => {
        if (!message.trim()) return;
        let trimmedMessage = message.trim();

        // ================================== msw 처리 ==================================
        if (import.meta.env.VITE_DEV_MODE == 2) {
            let n_msgHistory: ChatCompletionMessageParam[] = [];

            // system message settings
            const systemMsgList = parseStringList(config.system_message);
            for (const systemMsg of systemMsgList) {
                n_msgHistory.push({ role: "system", content: systemMsg });
            }

            if (safeRoomId === "0") {
                await createRoomMutation.mutateAsync(getTitle(trimmedMessage)).then((res) => {
                    safeRoomId = res.data.id;
                    navigate(`./${safeRoomId}`);
                });
            } else {
                if (config.max_message > 1) {
                    n_msgHistory = [...n_msgHistory, ...msgHistory.slice(-1 * (config.max_message - 1))];
                }
            }

            // messaage
            n_msgHistory.push({ role: "user", content: trimmedMessage });

            // 질문 요청(db)
            const n_seq = chatData.length ? chatData[chatData.length - 1].sequence + 1 : 0;
            const db_question: ChatCreateDto = {
                time: new Date().toISOString(),
                room_id: parseInt(safeRoomId),
                message: trimmedMessage,
                is_answer: 0,
                sequence: n_seq,
                used_model: config.selected_model,
            };
            const db_question_res_data: { id: number } = (await createChatMutation.mutateAsync(db_question)).data;

            /*
            openAi response mock
            */
            const completionContentMock =
                "Please install TokenMeter locally and add your OpenAI API key in the configuration settings before using it";
            n_msgHistory.push({ role: "assistant", content: completionContentMock });

            // 질문 응답(db)
            const db_answer: ChatCreateDto = {
                time: new Date().toISOString(),
                room_id: parseInt(safeRoomId),
                message: completionContentMock,
                is_answer: 1,
                sequence: n_seq === 0 ? 1 : n_seq + 1,
                used_model: config.selected_model,
                msg_history: JSON.stringify(n_msgHistory, null, 4),
                token_meter_prompt: 30,
                token_meter_completion: 40,
                token_meter_total: 70,
            };
            createChatMutation.mutate(db_answer);

            if (db_question_res_data.id) {
                updateChatMutation.mutate({
                    chatId: db_question_res_data.id,
                    msg_history: JSON.stringify(n_msgHistory, null, 4),
                    token_meter_prompt: 30,
                    token_meter_completion: 40,
                    token_meter_total: 70,
                });
            }
            setMessage("");
            return;
        }

        // ================================== 진짜 로직 ==================================
        if (openai) {
            setTextFieldOff(true);

            // url crawling/summarize/append
            if (config.crawling_enabled == 1) {
                setIsCrawlRunning(true);
                trimmedMessage = await crawlAndSummaryAndAppend(trimmedMessage);
                setIsCrawlRunning(false);
            }

            let n_msgHistory: ChatCompletionMessageParam[] = [];
            // system message settings
            const systemMsgList = parseStringList(config.system_message);
            for (const systemMsg of systemMsgList) {
                n_msgHistory.push({ role: "system", content: systemMsg });
            }

            if (safeRoomId === "0") {
                // 채팅 시작이면 방 만들고 -> navigate
                // setMsgHistory timming = when "chats" usequery running
                await createRoomMutation.mutateAsync(getTitle(trimmedMessage)).then((res) => {
                    safeRoomId = res.data.id;
                    navigate(`./${safeRoomId}`);
                });
            } else {
                // 보내는 거 포함해서 maximum_message_count
                if (config.max_message > 1) {
                    n_msgHistory = [...n_msgHistory, ...msgHistory.slice(-1 * (config.max_message - 1))];
                }
            }

            // temp: image input chat
            let imageInput: boolean = false;
            let fileHistory: ChatCompletionMessageParam | null = null;

            if (files.length > 0) {
                const n_content: ChatCompletionContentPart[] = [];
                n_content.push({ type: "text", text: trimmedMessage });

                files.forEach((v, i) => {
                    n_content.push({ type: "image_url", image_url: { url: v.base64 } });
                });
                n_msgHistory.push({ role: "user", content: n_content });
                setFiles([]);

                // temp: image input chat
                imageInput = true;
                fileHistory = { role: "user", content: trimmedMessage };
            } else {
                n_msgHistory.push({ role: "user", content: trimmedMessage });
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
                message: trimmedMessage,
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
                // console.log("######", n_msgHistory);
                const completion = await openai.chat.completions.create({
                    messages: n_msgHistory,
                    model: config.selected_model,
                });
                setTextFieldOff(false);
                setMessage(""); // Clear the input after sending

                /*
                temp: image input chat
                일단 이미지 첨부 경우, db에 별도 저장 없음
                추후에 별도 포인트 잡으면: 저장, TokenMeter Modal 수정 필요
                */
                if (imageInput && fileHistory) {
                    n_msgHistory.pop();
                    n_msgHistory.push(fileHistory);
                }

                const completionMsg = completion.choices[0].message;
                if (completionMsg.content) {
                    n_msgHistory.push({ role: "assistant", content: completionMsg.content });

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
            } catch (error: any) {
                alert(error);
            }
        } else if (!openai) {
            alert("Please register the API key first");
            navigate(CONFIG_URL);
        }
    };

    // 포커싱 안된 상태에서 enter 시 텍스트 입력 필드로
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter") {
                const active = document.activeElement;

                // 현재 포커스된 요소 확인
                // 일부 WYSIWYG 편집기나 커스텀 입력기는 <div contenteditable="true">로 구현되어 있음
                const isTypingElement =
                    active instanceof HTMLInputElement ||
                    active instanceof HTMLTextAreaElement ||
                    (active && active.getAttribute("contenteditable") === "true");

                // 아무 곳도 focus 안 되어 있을 때만 TextField에 focus 주고 Enter 무시
                if (!isTypingElement) {
                    inputRef.current?.focus();
                    e.preventDefault(); // 이때만 막음!
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

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
                borderRadius: 20,
                backgroundColor: isDragOver ? "#e0f7fa" : "white",
                border: isDragOver ? "2px dashed #03a9f4" : "2px solid transparent",
                transition: "border-color 0.2s, background-color 0.2s",
            }}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
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
            {isCrawlRunning ? (
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        alignSelf: "flex-start",
                        ml: 1,
                        mb: 1,
                    }}
                >
                    🔍 Searching web...
                </Typography>
            ) : textFieldOff ? (
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        alignSelf: "flex-start",
                        ml: 1,
                        mb: 1,
                    }}
                >
                    🧐 Please wait...
                </Typography>
            ) : null}
            <TextField
                inputRef={inputRef}
                fullWidth
                multiline
                disabled={textFieldOff}
                maxRows={safeRoomId !== "0" ? 8 : 20}
                placeholder={"Enter your question"}
                variant="outlined"
                sx={{
                    "& .MuiOutlinedInput-root": {
                        padding: 2,
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
