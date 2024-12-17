import { Box, Container, Typography } from "@mui/material";
import { blue } from "@mui/material/colors";
import { LeftComponent } from "../components/LeftComponent";
import Grid from "@mui/material/Grid2";
import { useApiKeyStore } from "../status/store";
import { useParams } from "react-router-dom";
import { SubmitComponent } from "../components/SubmitComponent";
import { ChatComponent } from "../components/ChatComponent";

export const Main = () => {
    const { apiKey, setApiKey } = useApiKeyStore();
    const { roomId } = useParams<{ roomId: string }>();

    return (
        <>
            <Container
                maxWidth="xl"
                sx={{ bgcolor: blue[50], width: "98vw", height: "98vh", paddingTop: 1, paddingBottom: 3 }}
            >
                <Grid container spacing={2} sx={{ height: "100%", width: "100%" }}>
                    <Grid size={{ xs: 3 }} sx={{ height: "100%" }}>
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
                </Grid>
            </Container>
        </>
    );
};
