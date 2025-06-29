import React, { useState } from "react";
import {
    Autocomplete,
    Box,
    Button,
    Container,
    IconButton,
    Slider,
    TextField,
    Typography,
    List,
    ListItem,
    ListItemText,
    Stack,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ConfigEntity } from "../interface/entity";
import { getAllConfig, updateConfigById } from "../api/api";
import { ConfigUpdateDto } from "../interface/dto";
import { useConfigStore } from "../status/store";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { parseStringList } from "../util/JsonUtil";

const models = [
    "You can use models that are not in the list",
    "gpt-4.1",
    "gpt-4.1-mini",
    "gpt-4.1-nano",
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
    const { config, setConfig, resetConfig } = useConfigStore();
    const [n_config, n_setConfig] = useState<ConfigEntity>({
        id: -1,
        openai_api_key: "",
        selected_model: "",
        max_message: -1,
        system_message: "",
    });
    const queryClient = useQueryClient();
    const [instruct, setInstruct] = useState("");
    const [maxMessageInput, setMaxMessageInput] = useState<string>("");

    const { isPending, error, data, isSuccess } = useQuery<ConfigEntity[]>({
        queryKey: ["configs"],
        queryFn: async () => {
            const data = await getAllConfig();
            if (data.length > 0) {
                setIsEditable(false);
                const d = data[data.length - 1];
                setConfig(d);
                n_setConfig(d);
                setMaxMessageInput(d.max_message.toString());
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
            setInstruct("");
            updateConfigMutation.mutate(n_config);
        }
    };

    const handleNumberInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setMaxMessageInput(value);

        const parsed = Number(value);
        if (!isNaN(parsed)) {
            if (parsed < 1) {
                n_setConfig((v) => {
                    return { ...v, max_message: 1 };
                });
            } else {
                n_setConfig((v) => {
                    return { ...v, max_message: parsed };
                });
            }
        }
    };

    const handleAdd = () => {
        const trimmed = instruct.trim();
        if (!trimmed) return;

        try {
            const prevList: string[] = JSON.parse(n_config.system_message || "[]");
            const newList = [...prevList, trimmed];
            n_setConfig((prev) => ({
                ...prev,
                system_message: JSON.stringify(newList),
            }));
            setInstruct("");
        } catch (error) {
            console.error("Failed to parse system_message:", error);
        }
    };

    const handleRemove = (index: number) => {
        try {
            const prevList: string[] = JSON.parse(n_config.system_message || "[]");
            const newList = prevList.filter((_, i) => i !== index);
            n_setConfig((prev) => ({
                ...prev,
                system_message: JSON.stringify(newList),
            }));
        } catch (error) {
            console.error("Failed to parse or update system_message:", error);
        }
    };

    if (isPending) return <Box>'Loading...'</Box>;
    if (error) return <Box> {`An error has occurred: ${error.message}`}</Box>;
    return (
        <Container
            maxWidth="lg"
            sx={{
                paddingY: 4,
                width: "100vw",
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
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
                        value={maxMessageInput}
                        onChange={handleNumberInputChange}
                        sx={{ width: "100%", marginBottom: 2 }}
                        disabled={!isEditable}
                    />
                </Box>
                <Box sx={{ mt: 1 }}>
                    <Typography variant="h5" gutterBottom>
                        System Instruction
                    </Typography>

                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                        <TextField
                            fullWidth
                            variant="filled"
                            label="system instruction"
                            value={instruct}
                            onChange={(e) => setInstruct(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && isEditable) {
                                    handleAdd();
                                }
                            }}
                            disabled={!isEditable}
                            slotProps={{
                                input: {
                                    sx: {
                                        paddingTop: 1,
                                    },
                                },
                            }}
                        />
                        <IconButton color="primary" onClick={handleAdd} disabled={!isEditable}>
                            <AddIcon />
                        </IconButton>
                    </Stack>

                    <List dense>
                        {parseStringList(n_config.system_message).map((instruction, index) => (
                            <ListItem
                                key={index}
                                secondaryAction={
                                    isEditable && (
                                        <IconButton edge="end" onClick={() => handleRemove(index)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    )
                                }
                            >
                                <ListItemText primary={`• ${instruction}`} />
                            </ListItem>
                        ))}
                    </List>
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
