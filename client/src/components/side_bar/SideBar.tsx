import { Box, IconButton, Typography } from "@mui/material";
import React, { useState } from "react";
import { ResizableBox, ResizeCallbackData } from "react-resizable";
import { useNavigate, useParams } from "react-router-dom";
import { CONFIG_URL, IMAGE_URL, MAIN_URL } from "../../constants/path.const";
import { grey } from "@mui/material/colors";
import ConfigIcon from "@mui/icons-material/Settings";
import EditIcon from "@mui/icons-material/Edit";

interface Props {
    children?: React.ReactNode;
}

export const SideBar = ({ children }: Props) => {
    const navigate = useNavigate();
    const [drawerWidth, setDrawerWidth] = useState(240);

    const configClickHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
        navigate(CONFIG_URL);
    };

    const handleNewChat = () => {
        navigate(MAIN_URL);
    };

    // onResizeStop 파라미터 타입 지정
    const handleResizeStop = (event: React.SyntheticEvent<Element>, data: ResizeCallbackData) => {
        setDrawerWidth(data.size.width);
    };

    return (
        <ResizableBox
            width={drawerWidth}
            axis="x"
            minConstraints={[180, 0]}
            resizeHandles={["e"]}
            onResizeStop={handleResizeStop}
            handle={
                <span
                    style={{
                        position: "absolute",
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: 5,
                        cursor: "col-resize",
                        background: "transparent",

                        display: "flex",
                        justifyContent: "flex-end",
                    }}
                >
                    <span
                        style={{
                            width: 1, // 실제 보이는 선의 두께
                            background: "#ccc", // 선 색상
                            height: "100%",
                        }}
                    />
                </span>
            }
            style={{
                backgroundColor: "#f5f5f5",
            }}
        >
            <Box
                sx={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <Box
                    sx={{
                        padding: 1,
                        display: "flex",
                        flexDirection: "row",
                    }}
                >
                    <IconButton
                        onClick={configClickHandler}
                        size="large"
                        sx={{
                            color: grey[900],
                        }}
                    >
                        <ConfigIcon />
                    </IconButton>
                    <IconButton color="inherit" onClick={handleNewChat}>
                        <EditIcon />
                    </IconButton>
                </Box>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        border: "1px solid #ccc",
                        borderRadius: 2,
                    }}
                >
                    <Box
                        sx={{
                            padding: 1,
                            cursor: "pointer",
                            "&:hover": { backgroundColor: "#f0f0f0" },
                        }}
                        onClick={() => navigate(`${MAIN_URL}`)}
                    >
                        <Typography variant="h6" textAlign="center" gutterBottom>
                            Token-Meter(Chat)
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            padding: 1,
                            cursor: "pointer",
                            "&:hover": { backgroundColor: "#f0f0f0" },
                        }}
                        onClick={() => navigate(`${IMAGE_URL}`)}
                    >
                        <Typography variant="h6" textAlign="center" gutterBottom>
                            Token-Meter(Image)
                        </Typography>
                    </Box>
                </Box>
                <Box
                    sx={{
                        flexGrow: 1, // 남는 공간 차지
                        overflowY: "auto", // 세로 스크롤
                    }}
                >
                    {children}
                </Box>
            </Box>
        </ResizableBox>
    );
};
