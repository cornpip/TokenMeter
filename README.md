# TokenMetered

로컬에서 OpenAI API를 사용하여 데이터를 기록합니다. (파일 업로드, 이미지 생성 가능)

## 서비스 장점

- ChatGPT 서비스를 구독 비용(20+2$)만큼 사용하지 않는다면?  
    - API KEY를 등록하고 사용한 만큼만 지불하자.
  
- ChatGPT는 별도 옵션을 해제하지 않으면 대화 기록을 학습에 사용한다.  
    - API로 요청한 대화는 학습에 사용되지 않는다.  

- 채팅 기록을 ChatGPT 플랫폼이 아닌 로컬DB에 저장할 수 있다.

- 사용되는 토큰량을 시각적으로 확인하고, 효율적인 대화 방법을 생각할 수 있다.

- 종종 ChatGPT(웹 사이트)만 느리고 API는 잘 동작할 때가 있다.  
    - ChatGPT(웹 사이트) 서비스 문제에 영향을 안 받는다.

## Tech Stack
- Front-end - TS, React, MUI, React-Query
- Back-end - Express
- DB - SQLite3
- DevOps - Docker

## Usage

Nodejs, npm이 설치된 환경에서 소스 다운로드 후(git clone, git pull, 파일 다운로드 ...등등)  
프로젝트 root 위치에서 아래 script를 입력합니다.
```
npm run start
```

_도커 배포 환경 개발 중... (25-02-16)_  

## DB
(sqlite3 DB) ./server/database.db 로 저장됩니다.  

db를 옮기고자 한다면 위 경로에 database.db를 교체할 수 있습니다.  
db를 삭제하면 새로운 database.db가 초기화/생성됩니다.


## Service Example Images
![1](./readme_img/1.png)
최초 실행시에 db가 생성되고, 그곳에 채팅 기록과 세팅값들이 저장됩니다.

<br> <br>

![1](./readme_img/2.png)  
openai-api-key - API KEY 등록이 필요합니다.  
Model - 기존의 모델을 선택하거나, 새로운 버전이 출시됐을 때 모델명을 입력하여 사용할 수 있습니다.  
maximum send message count - 질문에 올 응답을 제외한 고려되는 채팅 수 입니다. (아래 예시 참고)  
```
// maximum send message count example

question 1. ~
answer 1. ~
question 2. ~
answer 2. ~
question 3. ~
answer 3. ~

question 3. 을 보낸다면,

count=2 일 때
history = [answer 2. + question 3.] 

count=3 일 때
history = [question 2. + answer 2. + question 3.] 

count=4 일 때
history = [answer 1. + question 2. + answer 2. + question 3.] 

총 사용되는 토큰량은 history(질문 + 기존 내역) + question 3.(답변) 과 같습니다.
```
현재(25-02-16) 토큰 최소화를 위한 별도 기능이 없는 상태에서  
count = 3~5 정도를 권장합니다.

각 모델별로 책정된 토큰량이 다르니 [Openai 홈페이지](https://platform.openai.com/docs/pricing)를 참고하여 사용바랍니다.  

<br> <br>

![1](./readme_img/3.png)
API 응답을 받으면 대화 박스 옆에 토큰량이 나타납니다.  
질문 옆에 토큰량은 history(보낸 거 포함)의 총합이고  
답변 옆에 토큰량은 답변 하나에 대한 값입니다.

<br> <br>

![1](./readme_img/4.png)
토큰량 숫자를 클릭하면, 주고받은 채팅 범위, 토큰량 등을 확인할 수 있습니다.

<br> <br>

![1](./readme_img/7.png)
![1](./readme_img/8.png)
이미지 파일을 첨부할 수 있습니다.  
drag하거나 클립 아이콘을 클릭하여 추가할 수도 있습니다.  

현재(25-02-16) 채팅 내역에 전송한 파일이 별도 기록되지는 않습니다.  
다만, 요청 prompt 토큰량에 첨부된 파일의 토큰량도 포함됩니다.  
(위 스크린샷을 보면 작은 문장이지만 파일이 포함되어 1378 token이 나왔습니다.)

<br> <br>

![1](./readme_img/9.png)  
응답을 받기 전까지는 입력 박스가 disabled 됩니다.  
추후 Streaming(생성되는 답변을 실시간으로 보여줌)으로 수정할 예정입니다.

<br> <br>

![1](./readme_img/5.png)  
채팅방을 삭제할 수 있습니다.  

<br> <br>

![1](./readme_img/6.png) 
메뉴 상단에 이미지 아이콘을 클릭하거나 url /image를 입력하여 생성형AI 페이지로 이동합니다.

prompt를 입력하고, 생성할 이미지 사이즈와 Quality를 선택합니다.  

Revised Prompt는 이미지 생성에 최종적으로 사용된 Prompt입니다.  
(더 좋은 결과를 위해 입력한 Prompt가 수정된 결과입니다.)