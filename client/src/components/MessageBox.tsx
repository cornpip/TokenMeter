import { Box, TextField, Typography } from "@mui/material";
import React, { memo } from "react";
import { ChatEntity } from "../interface/entity";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import SyntaxHighlighter from "react-syntax-highlighter";
import { github } from "react-syntax-highlighter/dist/esm/styles/hljs";
import "github-markdown-css";
import { useTokenMeterModalStore } from "../status/store";

interface TokenMeterProps {
    v: ChatEntity;
}
const TokenMeter: React.FC<TokenMeterProps> = ({ v }) => {
    const isOpen = useTokenMeterModalStore((s) => s.open);
    const setIsOpen = useTokenMeterModalStore((s) => s.setOpen);
    const clickHandler = () => {
        setIsOpen(true, v);
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

interface TokenMeterProps {
    meter: number;
}

const TokenMeter: React.FC<TokenMeterProps> = ({ meter }) => {
    return (
        <Box
            sx={{
                // bgcolor: "#f0f0f0",
                display: "flex",
                alignItems: "flex-end",
                margin: "10px 0px",
                fontWeight: "bold",
            }}
        >
            <Typography variant="body2">{meter}</Typography>
        </Box>
    );
};

const CodeBlock: React.FC<any> = ({ node, inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || "");
    return !inline && match ? (
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
            {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
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

export const MessageBox = memo(({ v }: MessageBoxProps) => {
    let leftOrRight: string = v.is_answer ? "flex-end" : "flex-start";

    // Replace \n with space*2 + \n for rendering line breaks
    const formattedMessage = v.message.replace(/\n/g, "  \n");
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
                    maxWidth: "80%",
                    color: "black", // Text color
                    margin: "10px",
                    flexDirection: "column",
                }}
            >
                <ReactMarkdown
                    remarkPlugins={[remarkGfm, rehypeHighlight]}
                    rehypePlugins={[rehypeRaw]}
                    components={renderers}
                >
                    {formattedMessage}
                </ReactMarkdown>
            </Box>
            {v.is_answer == 0 && <TokenMeter v={v} />}
        </Box>
    );
});
