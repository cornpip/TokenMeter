import { Box, Button, Container, Input, Paper, TextField, Typography } from "@mui/material";
import { blue } from "@mui/material/colors";
import React, { useState } from "react";
import { useApiKeyStore } from "../status/store";

export const Manage = () => {
    const { apiKey, setApiKey } = useApiKeyStore();
    const [inputApiKey, setInputApiKey] = useState<string>("");
    const [isEditable, setIsEditable] = useState<boolean>(true);

    const handleFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            console.log(e.target.files);
        }
    };

    const handleRegistration = (e: React.MouseEvent<HTMLButtonElement>) => {
        setApiKey(inputApiKey);
        setIsEditable(false);
    };

    const handleCorrection = (e: React.MouseEvent<HTMLButtonElement>) => {
        setIsEditable(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputApiKey(e.target.value);
    };

    return (
        <>
            <Container
                maxWidth="xl"
                sx={{ bgcolor: blue[50], width: "100vw", height: "100vh", display: "flex", alignItems: "center" }}
            >
                <Container maxWidth="sm">
                    <Paper elevation={3} sx={{ padding: 3, marginTop: 8 }}>
                        <Typography variant="h5" component="h1" gutterBottom>
                            Config Setting
                        </Typography>
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                            }}
                        >
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                                <TextField
                                    sx={{ flexGrow: 1 }}
                                    label="openai-api-key"
                                    margin="normal"
                                    variant="standard"
                                    onChange={handleInputChange}
                                    disabled={!isEditable}
                                    value={isEditable ? inputApiKey : "*".repeat(inputApiKey.length)}
                                    required
                                />
                                {isEditable ? (
                                    <Button
                                        variant="contained"
                                        onClick={handleRegistration}
                                        sx={{ marginLeft: 2, marginY: 1, textTransform: "none", height: "50%" }}
                                    >
                                        registration
                                    </Button>
                                ) : (
                                    <Button
                                        variant="contained"
                                        onClick={handleCorrection}
                                        sx={{ marginLeft: 2, marginY: 1, textTransform: "none", height: "50%" }}
                                    >
                                        correction
                                    </Button>
                                )}
                            </Box>

                            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                <Typography sx={{ marginLeft: 1, flexGrow: 1 }} variant="body1" noWrap>
                                    No file selected
                                </Typography>
                                <Input
                                    id="folder-selector"
                                    type="file"
                                    inputProps={{ webkitdirectory: "webkitdirectory" }}
                                    onChange={handleFolderChange}
                                    style={{ display: "none" }}
                                />
                                <label htmlFor="folder-selector">
                                    <Button variant="contained" component="span" sx={{ textTransform: "none" }}>
                                        Select Your Data
                                    </Button>
                                </label>
                            </Box>
                            <Typography>{apiKey}</Typography>
                        </Box>
                    </Paper>
                </Container>
            </Container>
        </>
    );
};
