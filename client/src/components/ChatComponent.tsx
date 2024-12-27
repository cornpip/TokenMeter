import React, { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import { api, getChatsbyRoomId, getRoomById } from "../api/api";
import { ChatEntity, RoomEntity } from "../interface/entity";
import { useQuery } from "@tanstack/react-query";
import { ChatCompletionMessageParam } from "openai/src/resources/index.js";
import { MessageBox } from "./MessageBox";
import { useNavigate, useParams } from "react-router-dom";
import { useChatStore } from "../status/store";
import axios from "axios";

export const ChatComponent = () => {
    console.log("@@@ ChatComponent");
    /**
     * useParams은 동기 hook임
     * 그리고 path parameter componet는 path parameter 바뀌면 re-render됨
     */
    const navigate = useNavigate();
    const { roomId } = useParams<{ roomId: string }>();
    const safeRoomId = roomId ?? "0"; // 기본값 설정
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const msgHistory = useChatStore((state) => state.msgHistory);
    const setChatData = useChatStore((state) => state.setChatData);
    const setMsgHistory = useChatStore((state) => state.setMsgHistory);

    /**
     * roomErr로 if(roomErr)navigate; 하는거 보다 axios err 핸들링으로 navigate하는게 부드러움
     */
    const { error: roomErr } = useQuery<RoomEntity>({
        queryKey: ["room", safeRoomId],
        queryFn: async () => {
            try {
                return await getRoomById(safeRoomId);
            } catch (err) {
                if (axios.isAxiosError(err) && err.response && err.response.status === 404) {
                    console.log("room deleted");
                }
                navigate("/main");
                return null;
            }
        },
        retry: 2,
    });

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
            // console.log("msggggggggggg", msgHistory.length, msgHistory);
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" }); // 부드러운 스크롤
        }
    }, [msgHistory]);

    if (isPending) return <Box>'Loading...'</Box>;
    if (error) return <Box> {`An error has occurred: ${error.message}`}</Box>;
    return (
        <Box
            sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                overflow: "auto",
                flexGrow: 1,
            }}
        >
            {data.map((v, i) => (
                <MessageBox key={i} v={v} />
            ))}
            <Box ref={messagesEndRef}></Box>
        </Box>
    );
};
