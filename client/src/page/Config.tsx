import React, { useState } from "react";
import { Autocomplete, Box, Button, Container, Slider, TextField, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ConfigEntity } from "../interface/entity";
import { getAllConfig, updateConfigById } from "../api/api";
import { ConfigUpdateDto } from "../interface/dto";

const models = [
    "You can use models that are not in the list",
    "chatgpt-4o-latest",
    "gpt-4o-2024-11-20",
    "gpt-4o-2024-08-06",
    "gpt-4o",
    "gpt-4o-mini-2024-07-18",
    "gpt-4o-mini",
    // "o1",
    // "o1-mini",
    // "o1-preview", //o1은 주고 받는 api형식이 다른 듯
];

export const Config = () => {
    const [isEditable, setIsEditable] = useState<boolean>(false);
    const [config, setConfig] = useState<ConfigEntity>({
        id: -1,
        openai_api_key: "",
        selected_model: "",
        max_message: -1,
    });
    const [n_config, n_setConfig] = useState<ConfigEntity>({
        id: -1,
        openai_api_key: "",
        selected_model: "",
        max_message: -1,
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
                }
                setConfig(data[data.length - 1]);
                n_setConfig(data[data.length - 1]);
            }
            return data;
        },
    });

    const updateConfigMutation = useMutation({
        mutationFn: (dto: ConfigUpdateDto) => {
            return updateConfigById(dto);
        },
        onSuccess: (data, variable, context) => {
            console.log("config update success ", data);
            queryClient.invalidateQueries({ queryKey: ["configs"] });
        },
    });

    const handleRegistration = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (data) {
            updateConfigMutation.mutate(n_config);
        }
    };

    const handleNumberInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const count = Number(event.target.value);
        if (!isNaN(count)) {
            if (count < 1) {
                n_setConfig((v) => {
                    return { ...v, max_message: 1 };
                });
            } else {
                n_setConfig((v) => {
                    return { ...v, max_message: count };
                });
            }
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
                    width: "80%",
                }}
            >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <TextField
                        sx={{ flexGrow: 1 }}
                        label="openai-api-key"
                        margin="normal"
                        variant="standard"
                        onChange={(e) => {
                            n_setConfig((v) => {
                                return { ...v, openai_api_key: e.target.value };
                            });
                        }}
                        disabled={!isEditable}
                        value={
                            isEditable
                                ? n_config.openai_api_key
                                : n_config.openai_api_key
                                  ? "*".repeat(n_config.openai_api_key.length)
                                  : ""
                        }
                        required
                    />
                </Box>
                <Autocomplete
                    freeSolo
                    options={models}
                    value={n_config.selected_model}
                    onChange={(event, value) => {
                        if (value) {
                            n_setConfig((v) => {
                                return { ...v, selected_model: value };
                            });
                        }
                    }}
                    onInputChange={(event, value) => {
                        // 사용자가 TextField에 직접 입력했을 때 처리
                        n_setConfig((v) => {
                            return { ...v, selected_model: value };
                        });
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
                    disabled={!isEditable}
                />
                <Box>
                    <TextField
                        type="number"
                        label="maximum send message count"
                        variant="standard"
                        margin="normal"
                        value={n_config.max_message}
                        onChange={handleNumberInputChange}
                        sx={{ width: "100%", marginBottom: 2 }}
                        disabled={!isEditable}
                    />
                </Box>
                <Box
                    sx={{
                        display: "flex",
                        gap: 1,
                    }}
                >
                    {isEditable ? (
                        <Button
                            variant="contained"
                            onClick={handleRegistration}
                            color="secondary"
                            sx={{
                                textTransform: "none",
                                flex: 1,
                            }}
                        >
                            registration
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            onClick={() => {
                                setIsEditable(true);
                            }}
                            sx={{
                                textTransform: "none",
                                flex: 1,
                            }}
                        >
                            correction
                        </Button>
                    )}
                    <Button
                        variant="contained"
                        onClick={() => {
                            setIsEditable(false);
                            n_setConfig(config);
                        }}
                        sx={{
                            textTransform: "none",
                            flex: 1,
                        }}
                    >
                        cancel
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};
