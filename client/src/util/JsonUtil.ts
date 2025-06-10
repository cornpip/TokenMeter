export const parseStringList = (jsonString: string | null | undefined): string[] => {
    if (!jsonString || !jsonString.trim()) {
        return [];
    }

    try {
        const parsed = JSON.parse(jsonString);
        return Array.isArray(parsed) && parsed.every((item) => typeof item === "string") ? parsed : [];
    } catch (error) {
        console.error("Failed to parse JSON string:", error);
        return [];
    }
};
