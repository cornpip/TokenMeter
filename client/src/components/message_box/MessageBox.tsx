import { Box, Button, TextField, Typography } from "@mui/material";
import React, { memo, StrictMode, useState } from "react";
import { ChatEntity } from "../../interface/entity";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex"; // LaTeX 수식 렌더링 플러그인
import remarkMath from "remark-math"; // LaTeX 문법을 위한 플러그인
import SyntaxHighlighter from "react-syntax-highlighter";
import { github } from "react-syntax-highlighter/dist/esm/styles/hljs";
import "github-markdown-css";
import { useTokenMeterModalStore } from "../../status/store";
import "katex/dist/katex.min.css";
import "./KatexCustom.css";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";

interface TokenMeterProps {
    v: ChatEntity;
}
const TokenMeter: React.FC<TokenMeterProps> = ({ v }) => {
    const isOpen = useTokenMeterModalStore((s) => s.open);
    const setIsOpen = useTokenMeterModalStore((s) => s.setOpen);
    const clickHandler = () => {
        setIsOpen(true, v); // open 할 때 ChatEntity를 content로 줌
    };
    return (
        <Box
            onClick={clickHandler}
            sx={{
                // bgcolor: "#f0f0f0",
                display: "flex",
                alignItems: "flex-end",
                margin: "10px 0px",
                fontWeight: "bold",
                cursor: "pointer",
            }}
        >
            <Typography variant="body2">
                {v.is_answer == 1 ? v.token_meter_completion : v.token_meter_prompt}
            </Typography>
        </Box>
    );
};

const CodeBlock: React.FC<any> = ({ node, inline, className, children, ...props }) => {
    const [copied, setCopied] = useState(false);
    const match = /language-(\w+)/.exec(className || "");
    const codeString = String(children).replace(/\n$/, "");
    const language = match ? match[1] : "txt";

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(codeString);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // 2초 후 복사 상태 초기화
        } catch (err) {
            console.error("Copy failed", err);
        }
    };

    return !inline && match ? (
        <Box style={{ position: "relative", background: "#f6f8fa" }}>
            {/* language & copy btn */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingBottom: 1,
                }}
            >
                <Typography
                    variant="caption"
                    sx={{
                        color: "primary.main",
                        fontSize: "1em",
                        userSelect: "none", // drag X
                    }}
                >
                    {language}
                </Typography>
                <Button
                    onClick={copyToClipboard}
                    variant="text"
                    size="small"
                    startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
                    sx={{
                        display: "flex",
                        textTransform: "none",
                        color: copied ? "success.main" : "gray",
                        borderColor: copied ? "success.main" : "gray",
                        "&:hover": {
                            borderColor: copied ? "success.dark" : "black",
                            backgroundColor: "transparent",
                        },
                        fontSize: "1em",
                    }}
                >
                    {copied ? "Copied" : "Copy"}
                </Button>
            </Box>

            {/* Code block */}
            <SyntaxHighlighter
                language={match[1]}
                PreTag="div"
                {...props}
                style={github}
                customStyle={{
                    margin: "0",
                    padding: "0",
                    background: "inherit",
                    backgroundColor: "inherit",
                }}
            >
                {codeString}
            </SyntaxHighlighter>
        </Box>
    ) : (
        <code className={className} {...props}>
            {children}
        </code>
    );
};

const renderers: any = {
    code: CodeBlock,
};

interface MessageBoxProps {
    v: ChatEntity;
}

const processForSyntax = (text: string) => {
    return text
        .replace(/\n/g, " \n")
        .replace(/\\\\\[/g, "$$$$") // Replace '\\[' with '$$'
        .replace(/\\\\\]/g, "$$$$") // Replace '\\]' with '$$'
        .replace(/\\\\\(/g, "$$$$") // Replace '\\(' with '$$'
        .replace(/\\\\\)/g, "$$$$") // Replace '\\)' with '$$'
        .replace(/\\\[/g, "$$$$") // Replace '\[' with '$$'
        .replace(/\\\]/g, "$$$$") // Replace '\]' with '$$'
        .replace(/\\\(/g, "$$$$") // Replace '\(' with '$$'
        .replace(/\\\)/g, "$$$$"); // Replace '\)' with '$$';
};

/**
 * LaTeX-incompatible input = 수식안에 한글 있으면 warn 에러 있음
 * strict: false로 처리
 */
export const MessageBox = memo(({ v }: MessageBoxProps) => {
    let leftOrRight: string = v.is_answer ? "flex-end" : "flex-start";

    let formattedMessage = processForSyntax(v.message);
    // console.log(formattedMessage);
    return (
        <Box
            key={v.id}
            sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: leftOrRight,
            }}
        >
            {v.is_answer == 1 && <TokenMeter v={v} />}
            <Box
                className="markdown-body"
                sx={{
                    display: "flex",
                    bgcolor: "#ffffff", // Background color similar to the image
                    padding: "16px 16px",
                    borderRadius: "16px", // Rounded corners
                    boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)", // Shadow effect
                    width: "fit-content",
                    maxWidth: "60%",
                    color: "black", // Text color
                    margin: "10px",
                    flexDirection: "column",
                }}
            >
                <ReactMarkdown
                    remarkPlugins={[remarkGfm, rehypeHighlight, remarkMath]}
                    rehypePlugins={[[rehypeKatex, { strict: false }], rehypeRaw]}
                    components={renderers}
                >
                    {formattedMessage}
                </ReactMarkdown>
            </Box>
            {v.is_answer == 0 && <TokenMeter v={v} />}
        </Box>
    );
});
