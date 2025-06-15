import React, { useRef, useState, useEffect } from "react";
import { Stack, Typography, Box, Button, CircularProgress } from "@mui/material";
import axios from "axios";

type Point = [number, number];

export const ImageSegmentationUploader = () => {
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

    // 클릭 포인트 변할 때마다 자동 제출
    // useEffect(() => {
    //     if (clickPoints.length > 0) {
    //         submitWithPoints(clickPoints);
    //     } else {
    //         setResultUrl("");
    //     }
    // }, [clickPoints]);

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                width: "100%", // 필요하면 부모 너비 채우기
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
        </Box>
    );
};
