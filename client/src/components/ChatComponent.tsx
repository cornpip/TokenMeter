import React, { useEffect, useRef, useState } from 'react';
import { Box, IconButton, InputAdornment, TextField } from '@mui/material';
import { createChat, createChatDto, getChats } from '../api/api';
import { ChatEntity } from '../interface/entity';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useChatStore } from '../status/store';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/src/resources/index.js';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendIcon from '@mui/icons-material/Send';
import { MessageBox } from './MessageBox';

export const ChatComponent = () => {
    console.log('@@@ ChatComponent');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatId = useChatStore((state) => state.id);
    const [message, setMessage] = useState('');
    const [msgHistory, setMsgHistory] = useState<ChatCompletionMessageParam[]>([]);
    const openai = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_KEY,
        dangerouslyAllowBrowser: true,
    });
    const queryClient = useQueryClient();

    const { isPending, error, data, isSuccess } = useQuery<ChatEntity[]>({
        queryKey: ['chats', chatId],
        queryFn: () => {
            let getData = getChats(chatId);
            return getData;
        },
    });

    const chatCreateMutation = useMutation({
        mutationFn: (dto: createChatDto) => {
            return createChat(dto);
        },
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ['chats'] });
        },
    });

    const handleKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
        // console.log(event.key);
        if (event.key === 'Enter') {
            const target = event.target as HTMLInputElement;
            if (event.shiftKey) {
                // Shift + Enter adds a new line
                event.preventDefault();

                const start = target.selectionStart || 0;
                const end = target.selectionEnd || 0;
                const newMessage = message.substring(0, start) + '\n' + message.substring(end);
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
        if (message.trim() && data) {
            const n_msgHistory = [...msgHistory];
            n_msgHistory.push({ role: 'user', content: message });

            // 여기서 시간 걸림, 전송 중일때 ui 고려
            const completion = await openai.chat.completions.create({
                messages: n_msgHistory,
                model: 'gpt-4o-mini',
            });

            const dto: createChatDto = {
                time: new Date().toISOString(),
                room_id: chatId,
                message: message,
                is_answer: 0,
                sequence: data.length ? data[data.length - 1].sequence + 1 : 0,
            };
            chatCreateMutation.mutate(dto);

            const completionMsg = completion.choices[0].message;
            if (completionMsg.content) {
                n_msgHistory.push({ role: 'system', content: completionMsg.content });

                const dto: createChatDto = {
                    time: new Date().toISOString(),
                    room_id: chatId,
                    message: completionMsg.content,
                    is_answer: 1,
                    sequence: data.length ? data[data.length - 1].sequence + 2 : 1,
                };
                chatCreateMutation.mutate(dto);
            }

            setMsgHistory(n_msgHistory);
            setMessage(''); // Clear the input after sending
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setMessage(e.target.value);
    };

    useEffect(() => {
        console.log('## MsgHistory useEffect');
        if (isSuccess) {
            setMsgHistory([]);

            const initHistoryArr: ChatCompletionMessageParam[] = [];
            data.map((v) => {
                initHistoryArr.push({ role: v.is_answer === 1 ? 'system' : 'user', content: v.message });
            });
            setMsgHistory(initHistoryArr);
        }
    }, [isSuccess, data]);

    // msgHistory가 업데이트될 때 스크롤을 가장 아래로 이동
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' }); // 부드러운 스크롤
        }
    }, [msgHistory]);

    if (isPending) return <Box>'Loading...'</Box>;
    if (error) return <Box>'An error has occurred: ' + error.message</Box>;
    return (
        <Box
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
            }}
        >
            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', overflow: 'auto', flexGrow: 1 }}>
                {data.map((v, i) => (
                    <MessageBox key={i} v={v} />
                ))}
                <Box ref={messagesEndRef}></Box>
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    width: '100%',
                    borderRadius: '20px',
                    backgroundColor: 'white',
                }}
            >
                <TextField
                    fullWidth
                    multiline
                    maxRows={4}
                    placeholder="메시지 입력"
                    variant="outlined"
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            padding: '10px',
                            backgroundColor: '#f5f5f5',
                        },
                    }}
                    onChange={handleChange}
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
                                paddingRight: '50px',
                                borderRadius: '20px',
                            },
                        },
                    }}
                />
            </Box>
        </Box>
    );
};
