import React, { useEffect, useState } from "react";
import { Modal, Box, Typography, Button } from "@mui/material";
import { useTokenMeterModalStore } from "../status/store";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { WhereToVote } from "@mui/icons-material";

export const TokenMeterModal: React.FC = () => {
    const isOpen = useTokenMeterModalStore((s) => s.open);
    const content = useTokenMeterModalStore((s) => s.content);
    const setIsOpen = useTokenMeterModalStore((s) => s.setOpen);
    const [msgHistory, setMsgHistory] = useState<ChatCompletionMessageParam[]>([]);

    const closeHandler = () => {
        setIsOpen(false);
    };

    useEffect(() => {
        if (content) {
            // let msgHistory: ChatCompletionMessageParam[] = JSON.parse(content.msg_history);
            // console.log(msgHistory);
            setMsgHistory(JSON.parse(content.msg_history));
        }
    }, [isOpen]);

    return (
        <Modal
            open={isOpen}
            onClose={closeHandler}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box
                sx={{
                    position: "absolute" as const,
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "80%",
                    height: "85%",
                    display: "flex",
                    flexDirection: "column",
                    bgcolor: "background.paper",
                    border: "2px solid #000",
                    boxShadow: 24,
                    p: 3,
                    borderRadius: 2,
                }}
            >
                {/* 모달 제목 */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "baseline", // 텍스트 표시 기준선 맞추기
                        gap: 1, // 두 요소 간의 간격 조정
                    }}
                >
                    <Typography variant="body1" component="h2">
                        {`Used Token: ${content?.token_meter_total}`}
                    </Typography>
                    <Typography variant="body2" component="body">
                        {`${content?.token_meter_prompt}(prompt) + ${content?.token_meter_completion}(completion)`}
                    </Typography>
                </Box>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "baseline", // 텍스트 표시 기준선 맞추기
                        gap: 1, // 두 요소 간의 간격 조정
                    }}
                >
                    <Typography variant="body1" component="h2">
                        {`Used History: ${msgHistory.length}`}
                    </Typography>
                    <Typography variant="body2" component="body">
                        {`${msgHistory.length - 1}(prompt) + 1(completion)`}
                    </Typography>
                </Box>

                {/* 메시지 리스트 */}
                <Box
                    sx={{
                        overflowY: "auto",
                        mt: 2,
                        flexGrow: 1, // 남는 공간 모두 사용
                        maxHeight: "calc(100% - 64px)", // 부모 크기에서 닫기 버튼 높이를 제외한 영역
                    }}
                >
                    {msgHistory.map((v, i) => (
                        <Box
                            key={i}
                            sx={{
                                mb: 2,
                                p: 2,
                                border: "1px solid #ddd",
                                borderRadius: "8px",
                                bgcolor: i === msgHistory.length - 1 ? "#e0f7fa" : "#f9f9f9", // 마지막 아이템을 하이라이트
                                borderColor: i === msgHistory.length - 1 ? "#00796b" : "#ddd", // 하이라이트 색상 변경
                            }}
                        >
                            <Typography variant="caption" color="text.secondary">
                                {v.role} {i === msgHistory.length - 1 && "(completion text)"}
                            </Typography>
                            <Typography variant="body1">{v.content?.toString()}</Typography>
                        </Box>
                    ))}
                </Box>

                {/* 닫기 버튼 */}
                <Button
                    variant="contained"
                    color="primary"
                    onClick={closeHandler}
                    sx={{
                        mt: 2,
                    }}
                    fullWidth
                >
                    Close
                </Button>
            </Box>
        </Modal>
    );
};
