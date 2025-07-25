import { useState } from "react";
import {
    Box,
    Button,
    Container,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
} from "@mui/material";
import OpenAI from "openai";
import { useQuery } from "@tanstack/react-query";
import { ConfigEntity } from "../../interface/entity";
import { getAllConfig } from "../../api/api";
import { useNavigate } from "react-router-dom";
import { CONFIG_URL } from "../../constants/path.const";

type Resolution = "1024x1024" | "256x256" | "512x512" | "1792x1024" | "1024x1792" | null | undefined;

export const CreateImage = () => {
    const [prompt, setPrompt] = useState<string>("");
    const [revisedPrompt, setRevisedPrompt] = useState<string>("");
    const [imageUrl, setImageUrl] = useState<string>();
    const [loading, setLoading] = useState<boolean>(false);
    const [openai, setOpenai] = useState<OpenAI>();
    const [size, setSize] = useState<Resolution>("1024x1024");
    const [quality, setQuality] = useState<string>("standard");
    const navigate = useNavigate();

    const { isPending, error, data, isSuccess } = useQuery<ConfigEntity[]>({
        queryKey: ["configs"],
        queryFn: async () => {
            const data = await getAllConfig();
            if (data.length > 0) {
                const apiKey = data[data.length - 1].openai_api_key;
                if (apiKey) {
                    setOpenai(
                        () =>
                            new OpenAI({
                                apiKey,
                                dangerouslyAllowBrowser: true,
                            })
                    );
                } else {
                    setOpenai(undefined);
                }
            } else {
                setOpenai(undefined);
            }
            return data;
        },
    });

    const handleGenerateImage = async () => {
        if (!prompt) return;

        if (openai) {
            setLoading(true);
            try {
                // 주어진 예제에 따라 OpenAI API를 사용하여 이미지 생성
                const response = await openai.images.generate({
                    model: "dall-e-3",
                    prompt: prompt,
                    n: 1,
                    size: size,
                });

                // 생성된 이미지 URL 설정
                const url = response.data[0].url;
                if (response.data[0].revised_prompt) {
                    setRevisedPrompt(response.data[0].revised_prompt);
                }
                setImageUrl(url);
            } catch (error) {
                console.error("Error generating image:", error);
                alert(error);
            } finally {
                setLoading(false);
            }
        } else {
            alert("Please register the API key first");
            navigate(CONFIG_URL);
        }
    };

    if (isPending) return <Box>'Loading...'</Box>;
    if (error) return <Box> {`An error has occurred: ${error.message}`}</Box>;
    return (
        <Container
            sx={{
                width: "100%",
                height: "100vh", // 또는 부모가 height: 100%여야 함
                display: "flex",
                flexDirection: "column",
                overflow: "hidden", // 가로 스크롤 방지
                overflowY: "auto",
                marginTop: 7,
            }}
        >
            <Box
                sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                }}
            >
                <Typography variant="h4" gutterBottom>
                    Create Image
                </Typography>
                <TextField
                    label="enter your prompt"
                    variant="filled"
                    fullWidth
                    margin="normal"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                />

                <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
                    <FormControl sx={{ flexGrow: 1 }} margin="normal">
                        <InputLabel>{"Generate Image Size"}</InputLabel>
                        <Select
                            value={size}
                            onChange={(e) => setSize(e.target.value as Resolution)}
                            label={"Generate Image Size"}
                            variant="standard"
                        >
                            <MenuItem value="1024x1024">1024x1024</MenuItem>
                            <MenuItem value="1024x1792">1024x1792</MenuItem>
                            <MenuItem value="1792x1024">1792x1024</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl sx={{ flexGrow: 1 }} margin="normal">
                        <InputLabel>{"Generate Image Quality"}</InputLabel>
                        <Select
                            value={quality}
                            onChange={(e) => setQuality(e.target.value)}
                            variant="standard"
                            label={"Generate Image Quality"}
                        >
                            <MenuItem value="standard">standard</MenuItem>
                            <MenuItem value="hd">hd(high quality)</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleGenerateImage}
                    disabled={loading}
                    sx={{ mt: 2 }}
                >
                    {loading ? "Generating..." : "Generate Image"}
                </Button>
                {imageUrl && (
                    <Box
                        sx={{
                            marginTop: 2,
                            display: "flex",
                            flexDirection: "row",
                            gap: 2,
                            width: "100%",
                            alignItems: "center",
                        }}
                    >
                        <TextField
                            label="prompt refined"
                            variant="outlined"
                            fullWidth
                            multiline
                            maxRows={15}
                            margin="normal"
                            value={revisedPrompt}
                            disabled
                        />

                        {/* 이미지 표시 */}
                        <Box mt={4}>
                            <Typography variant="h6">Generated Image:</Typography>
                            <img src={imageUrl} alt="Generated" style={{ maxWidth: "100%", borderRadius: "8px" }} />
                        </Box>
                    </Box>
                )}
            </Box>
        </Container>
    );
};
