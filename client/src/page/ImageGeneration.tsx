import React, { useState } from "react";
import { Box, List, ListItemButton, ListItemText, Typography } from "@mui/material";
import { ResizableBox, ResizeCallbackData } from "react-resizable"; // 타입 import
import "react-resizable/css/styles.css";
import { CreateImage } from "../components/Image/CreateImage";
import { useNavigate } from "react-router-dom";
import { MAIN_URL } from "../constants/path.const";
import { CreateImageEdit } from "../components/Image/CreateImageEdit";
import { SideBar } from "../components/side_bar/SideBar";

const apiOptions = ["createImage", "createImageEdit"] as const;
type ApiOption = (typeof apiOptions)[number];

export const ImageGeneration = () => {
    const navigate = useNavigate();
    const [selectedApi, setSelectedApi] = useState<ApiOption>("createImage");
    const [drawerWidth, setDrawerWidth] = useState(240);
    const [windowHeight, setWindowHeight] = React.useState(window.innerHeight);

    const getApiOptionsTitle = (option: ApiOption): string => {
        switch (option) {
            case "createImage":
                return "Generate";
            case "createImageEdit":
                return "Edit(Inpaint)";
            default: {
                const _exhaustiveCheck: never = option;
                return _exhaustiveCheck;
            }
        }
    };

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
            <SideBar>
                <List>
                    {apiOptions.map((option) => (
                        <ListItemButton
                            key={option}
                            selected={selectedApi === option}
                            onClick={() => setSelectedApi(option)}
                        >
                            <ListItemText primary={getApiOptionsTitle(option)} />
                        </ListItemButton>
                    ))}
                </List>
            </SideBar>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                {renderContent()}
            </Box>
        </Box>
    );
};
