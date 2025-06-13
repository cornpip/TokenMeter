# TokenMeter  
- Use the OpenAI API locally just like ChatGPT. 
- Logs data to a local database and tracks token usage. 
 
## Run with Docker
 
### 1. Requirements 
- Environment where Docker Engine is running 
- docker-compose must be available 
 
### 2. How to Run 
1. Download or copy the [`docker-compose.yml`](https://github.com/cornpip/TokenMeter/blob/master/docker-compose.yml) file 
2. Run the command `docker compoes up`  
(If you’ve run this before and want the latest images, please run `docker compose pull` before `docker compose up`)

3. __Service URL: http://localhost/token_meter/viewer/main__ 

By default, the service runs on port 80.
To change this, modify {your_port} in the docker-compose.yml file:

```
// docker-compose.yml
...
    nginx:
        environment:
            <<: *common-environment
        image: cornpip77/token-meter-nginx
        ports:
            - {your_port}:80
...
```

## Run Without Docker

### 1. Requirements
- Node.js must be installed on your system

### 2. How to Run
1. git clone https://github.com/cornpip/TokenMeter.git
2. npm run start
3. __Service URL: http://localhost:7777/token_meter/viewer/main__

default port, Server: `7776`, client: `7777`

 
## SQLite Database 
 
- To back up or change the database, copy/replace/delete the `./server/database.db` file 
- If the database file is missing, a new one will be automatically created when the app starts.

 
## How to Use
 
![1](./readme_img/1.png)   
If no database exists, a new one is automatically created when the app starts, and all chat history and settings will be saved there. 
 
<br><br> 
 
![1](./readme_img/2.png)   

__Initial settings:__  
openai-api-key – You need to register your API key.   
Model – Select an existing model or manually input a new one when available.   
Maximum send message count – Determines how much chat history (excluding the assistant’s upcoming replies) is included in each message sent to the API.

__Example: Maximum Send Message Count__
``` 
Chat History
Q1 → A1 → Q2 → A2 → Q3 → A3

If you're sending Q3 with a message count of:
2 → History includes [A2, Q3]
3 → History includes [Q2, A2, Q3]
4 → History includes [A1, Q2, A2, Q3]

Total token usage = history + token usage for the response to Q3
```
Tip: As of February 2024, no automatic token optimization is available. A message count between 3–5 is recommended.

Refer to the OpenAI Pricing Page for token costs per model. [OpenAI Pricing Page](https://platform.openai.com/docs/pricing)
 
<br><br> 
 
![1](./readme_img/3.png)   
After a response is generated, the token count is displayed next to each message:
- The number beside a question is the total token usage (history + current message).
- The number beside an answer represents the token usage of the response only.
 
<br><br> 
 
![1](./readme_img/4.png)   
Click on a token count to view the message range used and detailed token stats.
 
<br><br> 
 
![1](./readme_img/7.png)   
![1](./readme_img/8.png)   
You can attach image files via drag-and-drop or by clicking the paperclip icon. 
 
Note: As of February 2024, attachments are not saved to chat history. However, their content is included in token calculations.
(You can see above — A short sentence and a file resulted in 1378 tokens) 
 
<br><br> 
 
![1](./readme_img/9.png)   
During response generation, the input box is disabled.
Real-time (streaming) responses are planned for a future update.
 
<br><br> 
 
![1](./readme_img/5.png)   
You can delete a chat room as needed. 
 
<br><br> 
 
![1](./readme_img/6.png)   
Click the image icon on the top menu or go to /token_meter/viewer/image to open the image generation page.
 
1. Enter a text prompt
2. Choose image size & quality
3. The "Revised Prompt" displays the final version used (may be modified to improve results)

## Questions & Feedback
I'm continuously improving TokenMeter and truly value your input.  
If you have any questions, bug reports, or feature requests, feel free to open an issue or submit a pull request. 