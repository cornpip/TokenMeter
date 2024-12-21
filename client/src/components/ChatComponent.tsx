import React, { useEffect, useRef, useState } from "react";
import { Box, IconButton, InputAdornment, TextField } from "@mui/material";
import { createChat, createChatDto, getChatsbyRoomId } from "../api/api";
import { ChatEntity } from "../interface/entity";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/src/resources/index.js";
import { MessageBox } from "./MessageBox";
import { useParams } from "react-router-dom";
import { useChatStore } from "../status/store";

export const ChatComponent = () => {
    console.log("@@@ ChatComponent");
    /**
     * useParams은 동기 hook임
     * 그리고 path parameter componet는 path parameter 바뀌면 re-render됨
     */
    const { roomId } = useParams<{ roomId: string }>();
    const safeRoomId = roomId ?? "0"; // 기본값 설정
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const msgHistory = useChatStore((state) => state.msgHistory);
    const setChatData = useChatStore((state) => state.setChatData);
    const setMsgHistory = useChatStore((state) => state.setMsgHistory);

    /**
     * 분리하니까 함수 진행 파이프 라인을 작성자 아니면 모르겠는데?
     * SubmitComponet에서 create하면 -> ChatComponent에서 reRender (queryKey: chats)
     */
    const { isPending, error, data, isSuccess } = useQuery<ChatEntity[]>({
        queryKey: ["chats", roomId],
        queryFn: async () => {
            const data = await getChatsbyRoomId(parseInt(safeRoomId));
            setChatData(data);
            return data;
        },
    });

    /**
     * 아래 로직
     * setMsgHistory 하는 건 openAi api를 위한 거, db/ui와 무관
     * setChat이 db/ui와 관련
     */
    useEffect(() => {
        if (isSuccess) {
            console.log("## MsgHistory useEffect");
            const msgArr: ChatCompletionMessageParam[] = [];
            data.map((v) => {
                msgArr.push({ role: v.is_answer === 1 ? "system" : "user", content: v.message });
            });
            setMsgHistory(msgArr);
        }
    }, [isSuccess, data]);

    // msgHistory가 업데이트될 때 스크롤을 가장 아래로 이동
    useEffect(() => {
        if (messagesEndRef.current) {
            console.log("msggggggggggg", msgHistory.length, msgHistory);
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" }); // 부드러운 스크롤
        }
    }, [msgHistory]);

    if (isPending) return <Box>'Loading...'</Box>;
    if (error) return <Box> {`An error has occurred: ${error.message}`}</Box>;
    return (
        <Box sx={{ width: "100%", display: "flex", flexDirection: "column", overflow: "auto", flexGrow: 1 }}>
            {data.map((v, i) => (
                <MessageBox key={i} v={v} />
            ))}
            <Box ref={messagesEndRef}></Box>
        </Box>
    );
};
