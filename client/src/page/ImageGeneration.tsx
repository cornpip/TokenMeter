import React, { useState } from "react";
import { Box, List, ListItemButton, ListItemText, Typography } from "@mui/material";
import { ResizableBox, ResizeCallbackData } from "react-resizable"; // 타입 import
import "react-resizable/css/styles.css";
import { CreateImage } from "../components/Image/CreateImage";
import { useNavigate } from "react-router-dom";
import { MAIN_URL } from "../constants/path.const";
import { CreateImageEdit } from "../components/Image/CreateImageEdit";

const apiOptions = ["createImage", "createImageEdit"] as const;
type ApiOption = (typeof apiOptions)[number];

export const ImageGeneration = () => {
    const navigate = useNavigate();
    const [selectedApi, setSelectedApi] = useState<ApiOption>("createImage");
    const [drawerWidth, setDrawerWidth] = useState(240);
    const [windowHeight, setWindowHeight] = React.useState(window.innerHeight);

    const renderContent = () => {
        switch (selectedApi) {
            case "createImage":
                return <CreateImage />;
            case "createImageEdit":
                return <CreateImageEdit />;
            default:
                return <Typography>선택된 API가 없습니다.</Typography>;
        }
    };

    // onResizeStop 파라미터 타입 지정
    const handleResizeStop = (event: React.SyntheticEvent<Element>, data: ResizeCallbackData) => {
        setDrawerWidth(data.size.width);
    };

    React.useEffect(() => {
        const onResize = () => setWindowHeight(window.innerHeight);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    return (
        <Box sx={{ display: "flex", minHeight: "100vh" }}>
            <ResizableBox
                width={drawerWidth}
                axis="x"
                minConstraints={[180, 0]}
                maxConstraints={[400, 0]}
                resizeHandles={["e"]}
                onResizeStop={handleResizeStop}
                handle={
                    <span
                        style={{
                            position: "absolute",
                            right: 0,
                            top: 0,
                            bottom: 0,
                            width: "5px",
                            cursor: "col-resize",
                            background: "#ccc",
                        }}
                    />
                }
                style={{
                    boxSizing: "border-box",
                    backgroundColor: "#f5f5f5",
                    height: "100%",
                }}
            >
                <Box sx={{ width: "100%", height: "100%" }}>
                    <Box
                        sx={{
                            paddingY: 3,
                            cursor: "pointer",
                            "&:hover": { backgroundColor: "#f0f0f0" }, // hover 효과도 가능
                        }}
                        onClick={() => navigate(`${MAIN_URL}`)}
                    >
                        <Typography variant="h6" textAlign="center" gutterBottom>
                            TokenMeter
                        </Typography>
                    </Box>
                    <List>
                        {apiOptions.map((option) => (
                            <ListItemButton
                                key={option}
                                selected={selectedApi === option}
                                onClick={() => setSelectedApi(option)}
                            >
                                <ListItemText primary={option} />
                            </ListItemButton>
                        ))}
                    </List>
                </Box>
            </ResizableBox>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                {renderContent()}
            </Box>
        </Box>
    );
};
