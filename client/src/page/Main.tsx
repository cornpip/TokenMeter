import { Box, Container, IconButton, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { SubmitComponent } from "../components/SubmitComponent";
import { ChatComponent } from "../components/ChatComponent";
import { LeftComponent } from "../components/LeftComponent";

export const Main = () => {
    const { roomId } = useParams<{ roomId: string }>();

    return (
        <Box
            sx={{
                height: "100vh",
                width: "100vw",
                display: "flex",
                overflow: "hidden",
            }}
        >
            <LeftComponent />
            <Box
                sx={{
                    height: "100%",
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {roomId ? (
                    <ChatComponent />
                ) : (
                    <Box
                        sx={{
                            height: "100%",
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Typography variant="h3" sx={{ marginBottom: 1 }}>
                            {"Start Token-Meter"}
                        </Typography>
                        <Box
                            sx={{
                                padding: 2,
                                width: "70%",
                            }}
                        >
                            <SubmitComponent />
                        </Box>
                    </Box>
                )}
            </Box>
        </Box>
    );
};
