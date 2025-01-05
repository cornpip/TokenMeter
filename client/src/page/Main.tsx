import { Box, Container, IconButton, Typography } from "@mui/material";
import { grey, blue } from "@mui/material/colors";
import { LeftComponent } from "../components/LeftComponent";
import Grid from "@mui/material/Grid2";
import { useNavigate, useParams } from "react-router-dom";
import { SubmitComponent } from "../components/SubmitComponent";
import { ChatComponent } from "../components/ChatComponent";
import ConfigIcon from "@mui/icons-material/Settings";
import { useLeftCompOpenStore } from "../status/store";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import EditIcon from "@mui/icons-material/Edit";

export const Main = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const isOpen = useLeftCompOpenStore((state) => state.isOpen);
    const setIsOpen = useLeftCompOpenStore((state) => state.setIsOpen);
    const navigate = useNavigate();

    const configClickHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
        navigate("/config");
    };

    const handleOpenToggle = () => {
        setIsOpen(!isOpen);
    };

    const handleNewChat = () => {
        navigate("/main");
    };

    return (
        <Container
            disableGutters
            maxWidth="xl"
            sx={{
                width: "98vw",
                height: "98vh",
                paddingTop: 1,
                paddingBottom: 2,
            }}
        >
            <Grid
                container
                spacing={2}
                sx={{
                    height: "100%",
                    width: "100%",
                    position: "relative",
                }}
            >
                <Box
                    sx={{
                        position: "absolute",
                        top: 16, // 상단 여백
                        right: 16, // 우측 여백
                        zIndex: 1, // 다른 요소 위에 표시되도록
                        display: "flex",
                        alignItems: "center",
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
                </Box>
                {isOpen ? (
                    <>
                        <Grid size={{ xs: 3 }} sx={{ height: "100%", transition: "width 0.3s" }}>
                            <LeftComponent />
                        </Grid>
                        <Grid size={{ xs: 9 }} sx={{ height: "100%" }}>
                            <Box
                                sx={{
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: roomId ? "space-between" : "center",
                                    alignItems: "center",
                                }}
                            >
                                {roomId ? (
                                    <ChatComponent />
                                ) : (
                                    <Typography variant="h3" sx={{ marginBottom: 3 }}>
                                        {"Start Local ChatGPT"}
                                    </Typography>
                                )}
                                <SubmitComponent />
                            </Box>
                        </Grid>
                    </>
                ) : (
                    <>
                        <Grid size={{ xs: 1 }}>
                            <Box
                                sx={{
                                    padding: 1,
                                    color: "black",
                                    display: "flex",
                                    alignItems: "center",
                                }}
                            >
                                <IconButton edge="start" color="inherit" onClick={handleOpenToggle}>
                                    {isOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                                </IconButton>
                                <Box>
                                    <IconButton color="inherit" onClick={handleNewChat}>
                                        <EditIcon />
                                    </IconButton>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 11 }} sx={{ height: "100%" }}>
                            <Box
                                sx={{
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: roomId ? "space-between" : "center",
                                    alignItems: "center",
                                }}
                            >
                                {roomId ? (
                                    <ChatComponent />
                                ) : (
                                    <Typography variant="h3" sx={{ marginBottom: 3 }}>
                                        {"Start Local ChatGPT"}
                                    </Typography>
                                )}
                                <SubmitComponent />
                            </Box>
                        </Grid>
                    </>
                )}
            </Grid>
        </Container>
    );
};
