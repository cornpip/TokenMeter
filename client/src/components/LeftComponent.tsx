import { Box, Container, Typography } from "@mui/material";
import { red } from "@mui/material/colors";
import { getRooms } from "../api/api";
import { RoomEntity } from "../interface/entity";
import { useQuery } from "@tanstack/react-query";
import { useChatStore } from "../status/store";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export const LeftComponent = () => {
    const navigate = useNavigate();
    const { roomId } = useParams<{ roomId: string }>();
    const safeRoomId = roomId ?? "0";
    const { isPending, error, data } = useQuery<RoomEntity[]>({
        queryKey: ["rooms"],
        queryFn: getRooms,
    });

    const handleClick = (id: number) => {
        if (id.toString() !== safeRoomId) {
            navigate(`/main/${id}`);
        }
    };

    if (isPending) return <Box>'Loading...'</Box>;
    if (error) return <Box>'An error has occurred: ' + error.message</Box>;
    return (
        <Container
            sx={{
                bgcolor: "#E7EBEF",
                height: "100%",
                width: "100%",
                overflowY: "auto",
                overflowX: "auto",
                maxHeight: "100%",

                // 스크롤바 스타일
                "&::-webkit-scrollbar": {
                    width: "8px", // 세로 스크롤바의 너비
                },
                "&::-webkit-scrollbar-track": {
                    background: "#E7EBEF", // 스크롤바 배경 색상
                },
                "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "#888", // 스크롤바 색상
                    borderRadius: "10px", // 둥글게 만들기
                },
                "&::-webkit-scrollbar-thumb:hover": {
                    backgroundColor: "#555", // 마우스를 올렸을 때 색상 변화
                },
                scrollbarWidth: "thin",
                scrollbarColor: "#888 #E7EBEF",
            }}
        >
            <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                {data.map((v, i) => (
                    <Box
                        key={v.id}
                        sx={{
                            minWidth: "100px",
                            display: "flex",
                            alignItems: "center",
                            bgcolor: "#f5f5f5", // Background color similar to the image
                            padding: "8px 16px",
                            borderRadius: "16px", // Rounded corners
                            boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
                            cursor: "pointer",
                            margin: "10px",
                            "&:hover": {
                                bgcolor: "#e0e0e0", // Background color on hover
                            },
                        }}
                        onClick={() => handleClick(v.id)}
                    >
                        <Typography variant="body2" color="textPrimary">
                            {v.name}
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Container>
    );
};
