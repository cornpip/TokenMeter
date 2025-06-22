import React, { useRef, useState, useEffect } from "react";
import { Stack, Typography, Box, Button, CircularProgress, Container, TextField } from "@mui/material";
import axios from "axios";
import OpenAI from "openai";
import { getAllConfig } from "../../api/api";
import { useQuery } from "@tanstack/react-query";
import { ConfigEntity } from "../../interface/entity";

type Point = [number, number];

export const CreateImageEdit = () => {
    const imgRef = useRef<HTMLImageElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const [clickPoints, setClickPoints] = useState<Point[]>([]);
    const [clickLabels, setClickLabels] = useState<number[]>([]);
    const [originalSize, setOriginalSize] = useState<{ width: number; height: number } | null>(null);
    const [loading, setLoading] = useState(false);
    const [resultUrl, setResultUrl] = useState<string>("");
    const [isDragging, setIsDragging] = useState(false);
    const [prompt, setPrompt] = useState("");
    const [editResultUrl, setEditResultUrl] = useState<string>("");
    const [openai, setOpenai] = useState<OpenAI>();
    const [resizedFileImageUrl, setResizedFileImageUrl] = useState<string>("");
    const [resizedMaskImageUrl, setResizedMaskImageUrl] = useState<string>("");

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

    // 기존 handleImageUpload 유지
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
            setImageFile(file);
            setClickPoints([]);
            setClickLabels([]);
            setResultUrl("");
        };
        reader.readAsDataURL(file);
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files.length > 0) {
            inputRef.current!.files = e.dataTransfer.files;
            handleImageUpload({ target: inputRef.current } as any);
        }
    };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

    // 클릭시 파일선택창 열기
    const handleClickArea = () => {
        inputRef.current?.click();
    };

    const handleImageLoad = () => {
        const img = imgRef.current;
        if (img) {
            setOriginalSize({ width: img.naturalWidth, height: img.naturalHeight });
        }
    };

    const submitWithPoints = async (points: Point[], labels: number[]) => {
        if (!imageFile || points.length === 0) return;

        const formData = new FormData();
        formData.append("image", imageFile);
        formData.append("point_coords", JSON.stringify(points));
        formData.append("point_labels", JSON.stringify(labels));
        console.log(labels, points);

        try {
            setLoading(true);
            const response = await axios.post("http://localhost:7775/segment", formData, {
                responseType: "blob",
            });
            const blobUrl = URL.createObjectURL(response.data);
            setResultUrl(blobUrl);
        } catch (err) {
            console.error("세그먼트 요청 실패:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!imageFile || clickPoints.length === 0 || clickLabels.length === 0) return;
        setResultUrl(""); // sam result
        setResizedMaskImageUrl("");
        setResizedFileImageUrl("");
        setEditResultUrl("");
        await submitWithPoints(clickPoints, clickLabels);
    };

    const handleImageMouseDown = (e: React.MouseEvent<HTMLImageElement>) => {
        e.preventDefault();
        if (!imgRef.current || !originalSize) return;

        const rect = imgRef.current.getBoundingClientRect();
        const scaleX = originalSize.width / imgRef.current.clientWidth;
        const scaleY = originalSize.height / imgRef.current.clientHeight;

        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        const label = e.button === 2 ? 0 : 1; // 우클릭: 배경, 좌클릭: 전경

        setClickPoints((prev) => [...prev, [x, y]]);
        setClickLabels((prev) => [...prev, label]);
    };

    const handleUndoPoint = () => {
        setClickPoints((prev) => prev.slice(0, -1));
        setClickLabels((prev) => prev.slice(0, -1));
    };

    const handleResetImage = () => {
        setPreviewUrl("");
        setResultUrl("");
        setClickPoints([]);
        setClickLabels([]);
        if (inputRef.current) inputRef.current.value = "";
    };

    const convertImageToPng = async (blob: Blob): Promise<File> => {
        const bitmap = await createImageBitmap(blob);
        const canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas context not available");

        ctx.drawImage(bitmap, 0, 0);
        return new Promise<File>((resolve) => {
            canvas.toBlob((pngBlob) => {
                if (!pngBlob) throw new Error("Failed to convert to PNG");
                resolve(new File([pngBlob], "converted.png", { type: "image/png" }));
            }, "image/png");
        });
    };

    /**
     * 원본 이미지를 비율 유지하며 정사각형 캔버스(사이즈 x 사이즈) 위에 그리고,
     * 빈 영역은 흰색 배경으로 채운 후 PNG Blob 반환
     */
    async function resizeAndPadImageFile(file: File, size: number): Promise<File> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext("2d")!;

                // 배경을 흰색으로 칠함
                ctx.fillStyle = "#fff";
                ctx.fillRect(0, 0, size, size);

                // 비율 유지하며 이미지 그리기
                const scale = Math.min(size / img.width, size / img.height);
                const w = img.width * scale;
                const h = img.height * scale;
                const x = (size - w) / 2;
                const y = (size - h) / 2;
                ctx.drawImage(img, x, y, w, h);

                canvas.toBlob((blob) => {
                    if (!blob) return reject(new Error("Failed to create blob"));
                    const paddedFile = new File([blob], "padded.png", { type: "image/png" });
                    resolve(paddedFile);
                }, "image/png");
            };
            img.onerror = () => reject(new Error("Failed to load image"));
            img.src = URL.createObjectURL(file);
        });
    }

    async function resizeAndPadMaskFile(file: File, size: number): Promise<File> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext("2d")!;

                // 배경 검정으로 채우기
                ctx.fillStyle = "black";
                ctx.fillRect(0, 0, size, size);

                // 마스크 원본을 임시 캔버스에 그려서 픽셀 데이터 가져오기
                const tmpCanvas = document.createElement("canvas");
                tmpCanvas.width = img.width;
                tmpCanvas.height = img.height;
                const tmpCtx = tmpCanvas.getContext("2d")!;
                tmpCtx.drawImage(img, 0, 0);

                // 원본 이미지 픽셀 데이터
                const imgData = tmpCtx.getImageData(0, 0, img.width, img.height);

                // 새 캔버스에 리사이즈 및 패딩 위치 계산
                const scale = Math.min(size / img.width, size / img.height);
                const w = img.width * scale;
                const h = img.height * scale;
                const x = Math.floor((size - w) / 2);
                const y = Math.floor((size - h) / 2);

                // 새 캔버스에 마스크 영역 복사 (픽셀 단위)
                // 1) 빈 ImageData 생성
                const newImgData = ctx.createImageData(size, size);
                const newData = newImgData.data;

                // 2) 원본 이미지 크기만큼 순회하면서 마스크 영역 복사
                for (let row = 0; row < img.height; row++) {
                    for (let col = 0; col < img.width; col++) {
                        const srcIdx = (row * img.width + col) * 4;
                        // 알파 값 확인 (마스크 영역 여부)
                        const alpha = imgData.data[srcIdx + 3];

                        // 마스크 영역이면 흰색(255,255,255,255), 아니면 검정(0,0,0,255)
                        const color = alpha > 128 ? 255 : 0;

                        // 새 캔버스 좌표 계산 (리사이즈 안 했으므로 일단 원본 크기로 복사 후 캔버스에 리사이즈 해야 함)
                        // => 일단 여기서는 새 캔버스에 바로 그리기보단,
                        // 임시 캔버스에 그리고 마지막에 ctx.drawImage(tmpCanvas, x, y, w, h) 하는게 더 편리

                        // 그래서 여기선 생략하고 임시 캔버스에 픽셀 변경 후 ctx.drawImage 처리 추천
                    }
                }

                // 위 픽셀 단위 작업 대신에 아래처럼 간단하게 처리

                // 임시 캔버스에서 픽셀 데이터 수정 (마스크 영역: 흰색, 나머지 검정)
                for (let i = 0; i < imgData.data.length; i += 4) {
                    // 기존 픽셀 밝기 계산 (적절히 R,G,B 평균 혹은 R값만 써도 됨)
                    const r = imgData.data[i];
                    const g = imgData.data[i + 1];
                    const b = imgData.data[i + 2];
                    const alpha = imgData.data[i + 3];

                    // 마스크 영역을 흰색으로 하고 나머지는 검정으로 처리해야 하므로 반전 적용
                    // 아래는 예시: 투명도가 높으면 검정, 아니면 흰색 (반전)
                    // 또는 밝기가 일정 이상이면 검정으로 간주하는 식으로 조정 가능

                    // 여기서는 알파 > 128 영역은 배경(검정)으로, 나머지를 흰색(마스크)으로 반전
                    if (alpha > 128) {
                        // 배경 영역 → 검정
                        imgData.data[i] = 0;
                        imgData.data[i + 1] = 0;
                        imgData.data[i + 2] = 0;
                        imgData.data[i + 3] = 255;
                    } else {
                        // 마스크 영역 → 흰색
                        imgData.data[i] = 255;
                        imgData.data[i + 1] = 255;
                        imgData.data[i + 2] = 255;
                        imgData.data[i + 3] = 255;
                    }
                }
                tmpCtx.putImageData(imgData, 0, 0);

                // 이제 리사이즈해서 새 캔버스에 그림
                ctx.drawImage(tmpCanvas, x, y, w, h);

                // PNG Blob 생성 및 반환
                canvas.toBlob((blob) => {
                    if (!blob) return reject(new Error("Failed to create mask blob"));
                    resolve(new File([blob], "mask.png", { type: "image/png" }));
                }, "image/png");
            };
            img.onerror = () => reject(new Error("Failed to load mask image"));
            img.src = URL.createObjectURL(file);
        });
    }

    const handleCreateImageEdit = async () => {
        if (!imageFile || !resultUrl || !prompt || !openai) return;

        setLoading(true);
        try {
            // 1. 원본 이미지 Blob 가져오기
            let fileImage: File;
            if (imageFile.type === "image/png") {
                fileImage = imageFile;
            } else {
                fileImage = await convertImageToPng(imageFile);
            }
            const resizedFileImage = await resizeAndPadImageFile(fileImage, 1024);
            setResizedFileImageUrl(URL.createObjectURL(resizedFileImage));

            // 2. 마스크 Blob → File (PNG로 가정)
            const maskBlob = await fetch(resultUrl).then((res) => res.blob());
            const maskFile = new File([maskBlob], "mask.png", { type: "image/png" });
            const resizedMaskImage = await resizeAndPadMaskFile(maskFile, 1024);
            setResizedMaskImageUrl(URL.createObjectURL(resizedMaskImage));

            const response = await openai.images.edit({
                // image: resizedFileImage,
                // mask: resizedMaskImage,
                image: fileImage,
                mask: maskFile,
                prompt: prompt,
                n: 1,
                size: "512x512",
                response_format: "url",
            });

            const url = response.data[0].url;
            if (url) {
                setEditResultUrl(url);
            }
        } catch (error) {
            console.error("OpenAI 편집 실패:", error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <Container
            sx={{
                p: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
            }}
        >
            <Typography
                variant="h4"
                gutterBottom
                sx={{
                    marginBottom: 3,
                }}
            >
                Create Image Edit
            </Typography>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                    gap: 2,
                }}
            >
                {!previewUrl ? (
                    <Box
                        onClick={handleClickArea}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        sx={{
                            border: "2px dashed #ccc",
                            borderRadius: 2,
                            p: 6,
                            textAlign: "center",
                            color: "#555",
                            cursor: "pointer",
                            userSelect: "none",
                            backgroundColor: isDragging ? "#e0f7fa" : "transparent", // 드래그 중일 때 배경색 변경
                            borderColor: isDragging ? "#00bcd4" : "#ccc", // 테두리 색상 변경
                            transition: "background-color 0.3s, border-color 0.3s",
                        }}
                    >
                        <Typography variant="body1" color="inherit" sx={{ mb: 1 }}>
                            click or drag an image
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                            (optional)
                        </Typography>
                        <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleImageUpload} />
                    </Box>
                ) : (
                    <Box
                        sx={{
                            p: 4,
                            border: "2px solid #ccc",
                        }}
                    >
                        <Box
                            position="relative"
                            display="inline-block"
                            onContextMenu={(e) => e.preventDefault()}
                            sx={{
                                height: 400,
                            }}
                        >
                            <img
                                ref={imgRef}
                                src={previewUrl}
                                onLoad={handleImageLoad}
                                onMouseDown={handleImageMouseDown}
                                alt="preview"
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "contain",
                                    cursor: "crosshair",
                                    display: "block",
                                    userSelect: "none",
                                }}
                            />

                            {/* 클릭 포인트, 마스크 이미지는 그대로 유지 */}

                            {originalSize &&
                                clickPoints.map(([x, y], index) => {
                                    const scaleX = imgRef.current!.clientWidth / originalSize.width;
                                    const scaleY = imgRef.current!.clientHeight / originalSize.height;
                                    const px = x * scaleX;
                                    const py = y * scaleY;
                                    const label = clickLabels[index];
                                    const color = label === 1 ? "red" : "blue";

                                    return (
                                        <Box
                                            key={index}
                                            position="absolute"
                                            top={py - 2.5}
                                            left={px - 2.5}
                                            width={5}
                                            height={5}
                                            bgcolor={color}
                                            borderRadius="50%"
                                            border="2px solid white"
                                            zIndex={10}
                                        />
                                    );
                                })}

                            {resultUrl && (
                                <img
                                    src={resultUrl}
                                    alt="mask"
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        width: "100%",
                                        height: "100%",
                                        opacity: 0.6,
                                        pointerEvents: "none",
                                        zIndex: 5,
                                        objectFit: "contain",
                                    }}
                                />
                            )}
                        </Box>

                        {/* 버튼 영역 */}
                        <Box sx={{ mt: 2, display: "flex", justifyContent: "center", gap: 2 }}>
                            <Button
                                variant={clickPoints.length === 0 ? "outlined" : "contained"}
                                onClick={handleUndoPoint}
                                disabled={clickPoints.length === 0}
                            >
                                Undo Point
                            </Button>
                            <Button
                                variant={!previewUrl ? "outlined" : "contained"}
                                onClick={handleResetImage}
                                disabled={!previewUrl}
                            >
                                Reset Image
                            </Button>
                            <Button
                                variant={clickPoints.length === 0 ? "outlined" : "contained"}
                                disabled={clickPoints.length === 0}
                                onClick={handleSubmit}
                            >
                                {loading ? <CircularProgress size={24} /> : "mask generate"}
                            </Button>
                        </Box>
                    </Box>
                )}

                <TextField
                    fullWidth
                    label="Prompt"
                    variant="outlined"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    sx={{ mb: 2 }}
                />

                <Button variant="contained" disabled={!resultUrl || !prompt} onClick={handleCreateImageEdit}>
                    {loading ? <CircularProgress size={24} /> : "OpenAI Image Edit"}
                </Button>

                {/* 마스크 미리보기 */}
                {resultUrl && (
                    <Box sx={{ mt: 2, textAlign: "center" }}>
                        <h4>Generated Mask Preview</h4>
                        <img
                            src={resultUrl}
                            alt="mask preview"
                            style={{
                                maxWidth: "100%",
                                maxHeight: 200,
                                border: "1px solid #ccc",
                                borderRadius: 4,
                                objectFit: "contain",
                            }}
                        />
                    </Box>
                )}

                {resizedFileImageUrl && (
                    <div>
                        <h4>Resized Original Image Preview</h4>
                        <img
                            src={resizedFileImageUrl}
                            alt="Resized Original"
                            style={{ maxWidth: 300, maxHeight: 300, border: "1px solid #ccc" }}
                        />
                    </div>
                )}

                {/* 리사이즈된 마스크 이미지 미리보기 */}
                {resizedMaskImageUrl && (
                    <div>
                        <h4>Resized Mask Image Preview</h4>
                        <img
                            src={resizedMaskImageUrl}
                            alt="Resized Mask"
                            style={{ maxWidth: 300, maxHeight: 300, border: "1px solid #ccc" }}
                        />
                    </div>
                )}

                {editResultUrl && (
                    <Box>
                        <h4>Edited Result Image:</h4>
                        <img
                            src={editResultUrl}
                            alt="edited"
                            style={{ maxWidth: 300, maxHeight: 300, border: "1px solid #ccc" }}
                        />
                    </Box>
                )}
            </Box>
        </Container>
    );
};
