import React, { useEffect, useRef, useState } from "react";
import { Box, IconButton, InputAdornment, TextField } from "@mui/material";
import { createChat, createChatDto, getChats } from "../api/api";
import { ChatEntity } from "../interface/entity";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/src/resources/index.js";
import { MessageBox } from "./MessageBox";
import { useParams } from "react-router-dom";

export const ChatComponent = () => {
    console.log("@@@ ChatComponent");
    const { roomId } = useParams<{ roomId: string }>();
    const safeRoomId = roomId ?? "0"; // 기본값 설정
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [msgHistory, setMsgHistory] = useState<ChatCompletionMessageParam[]>([]);

    const { isPending, error, data, isSuccess } = useQuery<ChatEntity[]>({
        queryKey: ["chats", roomId],
        queryFn: () => {
            return getChats(parseInt(safeRoomId));
        },
    });

    useEffect(() => {
        console.log("## MsgHistory useEffect");
        if (isSuccess) {
            const initHistoryArr: ChatCompletionMessageParam[] = [];
            data.map((v) => {
                initHistoryArr.push({ role: v.is_answer === 1 ? "system" : "user", content: v.message });
            });
            setMsgHistory(initHistoryArr);
        }
    }, [isSuccess, data]);

    // msgHistory가 업데이트될 때 스크롤을 가장 아래로 이동
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" }); // 부드러운 스크롤
        }
    }, [msgHistory]);

    if (isPending) return <Box>'Loading...'</Box>;
    if (error) return <Box>'An error has occurred: ' + error.message</Box>;
    return (
        <Box sx={{ width: "100%", display: "flex", flexDirection: "column", overflow: "auto", flexGrow: 1 }}>
            {data.map((v, i) => (
                <MessageBox key={i} v={v} />
            ))}
            <Box ref={messagesEndRef}></Box>
        </Box>
    );
};
