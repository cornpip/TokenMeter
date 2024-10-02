import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { purple } from '@mui/material/colors';
import { createChat, createChatDto, getChats } from '../api/api';
import { ChatEntity } from '../interface/entity';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useChatStore } from '../status/store';
import OpenAI from 'openai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import 'github-markdown-css';
import { ChatCompletionMessageParam } from 'openai/src/resources/index.js';

const CodeBlock: React.FC<any> = ({ node, inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
        <SyntaxHighlighter
            language={match[1]}
            PreTag="div"
            {...props}
            style={github}
            customStyle={{
                margin: '0',
                padding: '0',
                background: 'inherit',
                backgroundColor: 'inherit',
            }}
        >
            {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
    ) : (
        <code className={className} {...props}>
            {children}
        </code>
    );
};

const renderers: any = {
    code: CodeBlock,
};

export const ChatComponent = () => {
    console.log('@@@ ChatComponent');
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
        if (event.key === 'Enter') {
            if (event.shiftKey) {
                // Shift + Enter adds a new line
                event.preventDefault();

                const target = event.target as HTMLInputElement;
                const start = target.selectionStart || 0;
                const end = target.selectionEnd || 0;
                console.log(start, end);
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

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        setMessage(event.target.value);
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

    useEffect(() => {
        console.log('# MsgHistory useEffect');
        if (isSuccess) {
            setMsgHistory([]);

            const initHistoryArr: ChatCompletionMessageParam[] = [];
            data.map((v) => {
                initHistoryArr.push({ role: v.is_answer === 1 ? 'system' : 'user', content: v.message });
            });
            setMsgHistory(initHistoryArr);
        }
    }, [isSuccess, data]);

    if (isPending) return <Box>'Loading...'</Box>;
    if (error) return <Box>'An error has occurred: ' + error.message</Box>;
    return (
        <Box
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <Box sx={{ bgcolor: purple[50], width: '100%', display: 'flex', flexDirection: 'column', overflow: 'auto', height: '90%' }}>
                {data.map((v, i) => {
                    let leftOrRight: string = v.is_answer ? 'flex-end' : 'flex-start';
                    return (
                        <Box key={v.id} sx={{ display: 'flex', direction: 'row', justifyContent: leftOrRight }}>
                            <Box
                                className="markdown-body"
                                sx={{
                                    display: 'flex',
                                    bgcolor: '#ffffff', // Background color similar to the image
                                    padding: '16px 16px',
                                    borderRadius: '16px', // Rounded corners
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)', // Shadow effect
                                    width: 'fit-content',
                                    maxWidth: '80%',
                                    color: 'black', // Text color
                                    margin: '10px',
                                    flexDirection: 'column',
                                }}
                            >
                                <ReactMarkdown remarkPlugins={[remarkGfm, rehypeHighlight]} rehypePlugins={[rehypeRaw]} components={renderers}>
                                    {v.message}
                                </ReactMarkdown>
                            </Box>
                        </Box>
                    );
                })}
            </Box>
            <Box sx={{ height: '10%' }}>
                <Box
                    contentEditable
                    sx={{
                        // minHeight: "40%",
                        // maxHeight: '80%',
                        height: '100%',
                        overflowY: 'auto',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '16px',
                        outline: 'none',
                        '&:focus': {
                            borderColor: 'primary.main', // 포커스 시 테두리 색 변경
                        },
                    }}
                ></Box>
            </Box>
        </Box>
    );
};
