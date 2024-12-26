import React, { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import OpenAI from "openai";

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_KEY,
    dangerouslyAllowBrowser: true,
});

export const ImageTest = () => {
    const [prompt, setPrompt] = useState<string>("");
    const [imageUrl, setImageUrl] = useState<string>();
    const [loading, setLoading] = useState<boolean>(false);

    const handleGenerateImage = async () => {
        if (!prompt) return;

        setLoading(true);
        try {
            // 주어진 예제에 따라 OpenAI API를 사용하여 이미지 생성
            const response = await openai.images.generate({
                model: "dall-e-3",
                prompt: prompt,
                n: 1,
                size: "1024x1024",
            });

            // 생성된 이미지 URL 설정
            const url = response.data[0].url;
            setImageUrl(url);
        } catch (error) {
            console.error("Error generating image:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h4" gutterBottom>
                Generate an Image
            </Typography>
            <TextField
                label="Image Prompt"
                variant="outlined"
                fullWidth
                margin="normal"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
            />
            <Button variant="contained" color="primary" onClick={handleGenerateImage} disabled={loading}>
                {loading ? "Generating..." : "Generate Image"}
            </Button>
            {imageUrl && (
                <Box mt={4}>
                    <Typography variant="h6">Generated Image:</Typography>
                    <img src={imageUrl} alt="Generated" style={{ maxWidth: "100%", borderRadius: "8px" }} />
                </Box>
            )}
        </Box>
    );
};
