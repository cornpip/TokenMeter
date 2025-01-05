import React, { useState } from "react";
import { Autocomplete, Box, Button, Container, TextField, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ConfigEntity } from "../interface/entity";
import { getAllConfig, updateConfigById, updateConfigDto } from "../api/api";

const models = [
    "You can use models that are not in the list",
    "chatgpt-4o-latest",
    "gpt-4o-mini",
    // "o1",
    // "o1-mini",
    // "o1-preview", //o1은 주고 받는 api형식이 다른 듯
];

export const Config = () => {
    const [inputApiKey, setInputApiKey] = useState<string>("");
    const [isEditable, setIsEditable] = useState<boolean>(true);
    const [config, setConfig] = useState<ConfigEntity>({
        id: -1,
        openai_api_key: "",
        selected_model: "",
    });
    const queryClient = useQueryClient();

    const { isPending, error, data, isSuccess } = useQuery<ConfigEntity[]>({
        queryKey: ["configs"],
        queryFn: async () => {
            const data = await getAllConfig();
            if (data.length > 0) {
                const apiKey = data[data.length - 1].openai_api_key;
                if (apiKey) {
                    setIsEditable(false);
                    setInputApiKey(apiKey);
                }
                setConfig(data[data.length - 1]);
            }
            return data;
        },
    });

    const updateConfigMutation = useMutation({
        mutationFn: (dto: updateConfigDto) => {
            return updateConfigById(dto);
        },
        onSuccess: (data, variable, context) => {
            console.log("config update success ", data);
            queryClient.invalidateQueries({ queryKey: ["configs"] });
        },
    });

    const handleRegistration = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (data) {
            const dto: updateConfigDto = {
                id: data[data.length - 1].id,
                openai_api_key: inputApiKey,
            };
            updateConfigMutation.mutate(dto);
        }
    };

    if (isPending) return <Box>'Loading...'</Box>;
    if (error) return <Box> {`An error has occurred: ${error.message}`}</Box>;
    return (
        <Container
            maxWidth="lg"
            sx={{
                width: "100vw",
                height: "100vh",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <Typography variant="h3"> {"Config Settings"} </Typography>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    marginTop: 5,
                    width: "50%",
                }}
            >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <TextField
                        sx={{ flexGrow: 1 }}
                        label="openai-api-key"
                        margin="normal"
                        variant="standard"
                        onChange={(e) => {
                            setInputApiKey(e.target.value);
                        }}
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
                            onClick={() => {
                                setIsEditable(true);
                            }}
                            sx={{ marginLeft: 2, marginY: 1, textTransform: "none", height: "50%" }}
                        >
                            correction
                        </Button>
                    )}
                </Box>
                <Autocomplete
                    freeSolo
                    options={models}
                    value={config.selected_model}
                    onChange={(event, value) => {
                        if (value) {
                            let n_config: ConfigEntity = { ...config, selected_model: value };
                            updateConfigMutation.mutate(n_config);
                        }
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Model"
                            variant="standard"
                            margin="normal"
                            disabled={!isEditable}
                        />
                    )}
                />
                {/* <Typography> {"Config2 Setting"} </Typography> */}
            </Box>
        </Container>
    );
};
