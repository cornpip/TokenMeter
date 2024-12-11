import { Box } from "@mui/material";
import React, { memo } from "react";
import { ChatEntity } from "../interface/entity";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import SyntaxHighlighter from "react-syntax-highlighter";
import { github } from "react-syntax-highlighter/dist/esm/styles/hljs";
import "github-markdown-css";

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
    console.log("@@@ MessageBox");

    let leftOrRight: string = v.is_answer ? "flex-end" : "flex-start";
    return (
        <Box key={v.id} sx={{ display: "flex", direction: "row", justifyContent: leftOrRight }}>
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
                    {v.message}
                </ReactMarkdown>
            </Box>
        </Box>
    );
});
