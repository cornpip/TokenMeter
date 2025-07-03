import { http, HttpResponse } from "msw";
import { ChatEntity, ConfigEntity, RoomEntity } from "../interface/entity";
import { ChatCreateDto, ChatUpdateDto, ConfigUpdateDto } from "../interface/dto";

let rooms: RoomEntity[] = [
    { id: 1, name: "Mock Room Markdown" },
    { id: 2, name: "Mock Room Katex" },
];

const msgList: string[] = [
    // 0
    "write Java code to implement permutations and combinations.",

    // 1
    "Sure! Here are Java methods to generate permutations and combinations of a given array or list of integers.\n" +
        "### Permutations\n" +
        "This method generates all permutations of an array using backtracking:\n" +
        "```java\n" +
        "import java.util.ArrayList;\n" +
        "import java.util.List;\n" +
        "public class PermutationsCombinations {\n" +
        "    // Generate all permutations of array nums\n" +
        "    public static List<List<Integer>> permute(int[] nums) {\n" +
        "        List<List<Integer>> results = new ArrayList<>();\n" +
        "        permuteHelper(nums, 0, results);\n" +
        "        return results;\n" +
        "    }\n" +
        "    private static void permuteHelper(int[] nums, int start, List<List<Integer>> results) {\n" +
        "        if (start == nums.length) {\n" +
        "            List<Integer> permutation = new ArrayList<>();\n" +
        "            for (int num : nums) {\n" +
        "                permutation.add(num);\n" +
        "            }\n" +
        "            results.add(permutation);\n" +
        "            return;\n" +
        "        }\n" +
        "        for (int i = start; i < nums.length; i++) {\n" +
        "            swap(nums, start, i);\n" +
        "            permuteHelper(nums, start + 1, results);\n" +
        "            swap(nums, start, i); // backtrack\n" +
        "        }\n" +
        "    }\n" +
        "    private static void swap(int[] nums, int i, int j) {\n" +
        "        int temp = nums[i];\n" +
        "        nums[i] = nums[j];\n" +
        "        nums[j] = temp;\n" +
        "    }\n" +
        "}\n" +
        "```\n" +
        "### Combinations\n" +
        "This method generates all combinations of `k` elements from the array `nums`:\n" +
        "```java\n" +
        "// Generate all combinations of k elements from nums\n" +
        "public static List<List<Integer>> combine(int[] nums, int k) {\n" +
        "    List<List<Integer>> results = new ArrayList<>();\n" +
        "    combineHelper(nums, k, 0, new ArrayList<>(), results);\n" +
        "    return results;\n" +
        "}\n" +
        "private static void combineHelper(int[] nums, int k, int start, List<Integer> current, List<List<Integer>> results) {\n" +
        "    if (current.size() == k) {\n" +
        "        results.add(new ArrayList<>(current));\n" +
        "        return;\n" +
        "    }\n" +
        "    for (int i = start; i < nums.length; i++) {\n" +
        "        current.add(nums[i]);\n" +
        "        combineHelper(nums, k, i + 1, current, results);\n" +
        "        current.remove(current.size() - 1); // backtrack\n" +
        "    }\n" +
        "}\n" +
        "// Example usage\n" +
        "public static void main(String[] args) {\n" +
        "    int[] nums = {1, 2, 3};\n" +
        '    System.out.println("Permutations:");\n' +
        "    List<List<Integer>> permutations = permute(nums);\n" +
        "    for (List<Integer> p : permutations) {\n" +
        "        System.out.println(p);\n" +
        "    }\n" +
        '    System.out.println("\\nCombinations of size 2:");\n' +
        "    List<List<Integer>> combinations = combine(nums, 2);\n" +
        "    for (List<Integer> c : combinations) {\n" +
        "        System.out.println(c);\n" +
        "    }\n" +
        "}\n" +
        "```\n" +
        "### Explanation\n" +
        "- `permute` generates all possible orderings of the elements.\n" +
        "- `combine` generates all possible subsets of size `k` (combinations).\n" +
        "- Both use backtracking to explore all possible states.\n" +
        "Let me know if you'd like variation for strings or other data types!",

    // 2
    "Show me the derivation process of the AI likelihood probability.",

    // 3
    "Certainly! To clarify, it sounds like you're asking for the derivation of the likelihood probability in the context of AI, which typically involves understanding how likelihood functions are derived and used, especially in probabilistic models, such as in machine learning.\n\nLet's consider a common scenario: you have a dataset and a probabilistic model with parameters \u03B8. The likelihood function represents the probability of the observed data given the parameters \u03B8.\n\n---\n## Derivation of the Likelihood Probability\n\n### Setup:\n- Suppose you have observed data \\( D = \\{x_1, x_2, ..., x_n\\} \\).\n- You have a model with parameters \\(\u03B8\\).\n- You want to find the likelihood function \\( L(\u03B8) = P(D|\u03B8) \\), i.e., the probability of the data given the parameters.\n\n### Step 1: Define the probability model\nIf the data points are independent and identically distributed (i.i.d), then the joint probability is the product of individual probabilities:\n\\[\nP(D|\u03B8) = P(x_1, x_2, ..., x_n | \u03B8) = \\prod_{i=1}^n P(x_i | \u03B8)\n\\]\n\n### Step 2: Likelihood function \\(L(\u03B8)\\)\nThe likelihood function treats the data as fixed and the parameters \\(\u03B8\\) as variables:\n\\[\nL(\u03B8) = \\prod_{i=1}^n P(x_i | \u03B8)\n\\]\nThis function tells us how \"likely\" the parameter values \\(\u03B8\\) are, given the observed data.\n\n### Step 3: Log-Likelihood function\nBecause products can be numerically unstable or inconvenient (especially for large n), we often use the logarithm:\n\\[\n\ell(\u03B8) = \\log L(\u03B8) = \\sum_{i=1}^n \\log P(x_i | \u03B8)\n\\]\nMaximizing \\(\ell(\u03B8)\\) is equivalent to maximizing \\(L(\u03B8)\\).\n\n---\n### Example: Bernoulli likelihood\nFor a Bernoulli trial where each \\(x_i \\in \\{0,1\\}\\) and the probability of success is \\(\u03B8\\):\n\\[\nP(x_i|\u03B8) = \u03B8^{x_i} (1 - \u03B8)^{1 - x_i}\n\\]\nTherefore,\n\\[\nL(\u03B8) = \\prod_{i=1}^n \u03B8^{x_i} (1 - \u03B8)^{1 - x_i} = \u03B8^{\\sum x_i} (1 - \u03B8)^{n - \\sum x_i}\n\\]\nand,\n\\[\n\ell(\u03B8) = \\sum_{i=1}^n \\left[x_i \\log \u03B8 + (1 - x_i) \\log (1 - \u03B8)\\right]\n\\]\n\n---\n### Summary\n- **Likelihood** is the probability of the data given model parameters.\n- It is derived by assuming the joint probability over all data (often i.i.d.).\n- Log-likelihood is used for easier optimization.\n\nIf you need a derivation under a specific AI model context (like Bayesian, neural networks, Hidden Markov Models), please specify!",
];

let chats: ChatEntity[] = [
    {
        id: 1,
        time: "",
        message: msgList[0],
        sequence: 1,
        is_answer: 0,
        room_id: 1,
        msg_history: `[
            {
                "role": "user",
                "content": ${JSON.stringify(msgList[0])}
            },
            {
                "role": "assistant",
                "content": ${JSON.stringify(msgList[1])}
            }
        ]`,
        token_meter_prompt: 15,
        token_meter_completion: 30,
        token_meter_total: 45,
        used_model: "gpt-4",
    },
    {
        id: 2,
        time: "",
        message: msgList[1],
        sequence: 2,
        is_answer: 1,
        room_id: 1,
        msg_history: `[
            {
                "role": "user",
                "content": ${JSON.stringify(msgList[0])}
            },
            {
                "role": "assistant",
                "content": ${JSON.stringify(msgList[1])}
            }
        ]`,
        token_meter_prompt: 20,
        token_meter_completion: 25,
        token_meter_total: 45,
        used_model: "gpt-4",
    },
    {
        id: 3,
        time: "",
        message: msgList[2],
        sequence: 1,
        is_answer: 0,
        room_id: 2,
        msg_history: `[
            {
                "role": "user",
                "content": ${JSON.stringify(msgList[2])}
            },
            {
                "role": "assistant",
                "content": ${JSON.stringify(msgList[3])}
            }
        ]`,
        token_meter_prompt: 15,
        token_meter_completion: 30,
        token_meter_total: 45,
        used_model: "gpt-4",
    },
    {
        id: 4,
        time: "",
        message: msgList[3],
        sequence: 2,
        is_answer: 1,
        room_id: 2,
        msg_history: `[
            {
                "role": "user",
                "content": ${JSON.stringify(msgList[2])}
            },
            {
                "role": "assistant",
                "content": ${JSON.stringify(msgList[3])}
            }
        ]`,
        token_meter_prompt: 20,
        token_meter_completion: 25,
        token_meter_total: 45,
        used_model: "gpt-4",
    },
];

let configs: ConfigEntity[] = [
    {
        id: 1,
        openai_api_key: "mock-key",
        selected_model: "gpt-4",
        max_message: 5,
        system_message:
            '["When providing an answer that includes code, always put the code inside a Markdown code block using triple backticks (```) and include the appropriate language identifier (e.g., ```python, ```javascript). Any explanations or other text should be written outside of the code block. If your answer does not include code, just write your response as usual."]',
    },
];

export const handlers = [
    // ========== ROOMS ==========
    http.get("/rooms", () => {
        return HttpResponse.json(rooms);
    }),

    http.get("/rooms/:id", ({ params }) => {
        const room = rooms.find((r) => r.id === Number(params.id));
        return room ? HttpResponse.json(room) : HttpResponse.json({ error: "Room not found" }, { status: 404 });
    }),

    http.post("/rooms", async ({ request }) => {
        const body = (await request.json()) as { name: string };
        const { name } = body;
        const newRoom: RoomEntity = { id: Date.now(), name };
        rooms.push(newRoom);
        return HttpResponse.json(newRoom, { status: 201 });
    }),

    http.put("/rooms/:id", async ({ request, params }) => {
        const body = (await request.json()) as { name: string };
        const { name } = body;
        const id = Number(params.id);
        rooms = rooms.map((r) => (r.id === id ? { ...r, name } : r));
        return HttpResponse.json({ success: true });
    }),

    http.delete("/rooms/:id", ({ params }) => {
        const id = Number(params.id);
        rooms = rooms.filter((r) => r.id !== id);
        return HttpResponse.json({ success: true });
    }),

    // ========== CHATS ==========
    http.get("/chats/room/:roomId", ({ params }) => {
        const roomId = Number(params.roomId);
        const roomChats = chats.filter((c) => c.room_id === roomId);
        return HttpResponse.json(roomChats);
    }),

    http.post("/chats", async ({ request }) => {
        const chat: ChatCreateDto = (await request.json()) as ChatCreateDto;
        const newId = chats.length > 0 ? chats[chats.length - 1].id + 1 : 1;
        const newChat: ChatEntity = {
            id: newId,
            ...chat,
            msg_history: chat.msg_history ?? "",
            token_meter_prompt: chat.token_meter_prompt ?? 0,
            token_meter_completion: chat.token_meter_completion ?? 0,
            token_meter_total: chat.token_meter_total ?? 0,
        };
        chats.push(newChat);
        return HttpResponse.json(newChat, { status: 201 });
    }),

    http.put("/chats/:chatId", async ({ request, params }) => {
        const chatId = Number(params.chatId);
        const updated: ChatUpdateDto = (await request.json()) as ChatUpdateDto;
        chats = chats.map((c) =>
            c.id === chatId
                ? {
                      ...c,
                      ...updated,
                      id: c.id, // id는 기존 값 유지
                  }
                : c
        );
        return HttpResponse.json({ success: true });
    }),

    http.delete("/chats/:chatId", ({ params }) => {
        const chatId = Number(params.chatId);
        chats = chats.filter((c) => c.id !== chatId);
        return HttpResponse.json({ success: true });
    }),

    // ========== CONFIG ==========
    http.get("/configs/all", () => {
        return HttpResponse.json(configs);
    }),

    http.put("/configs/:id", async ({ request, params }) => {
        const updated: ConfigUpdateDto = (await request.json()) as ConfigUpdateDto;
        const id = Number(params.id);
        configs = configs.map((conf) =>
            conf.id === id
                ? {
                      ...conf,
                      ...updated,
                      id: conf.id, // id는 기존 값 유지
                  }
                : conf
        );
        // 업데이트 된 config 반환 (최신 값)
        const updatedConfig = configs.find((conf) => conf.id === id);
        return HttpResponse.json(updatedConfig);
    }),
];
