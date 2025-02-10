# TokenMetered

로컬에서 OpenAI API를 사용하여 데이터를 기록합니다. (파일 업로드, 이미지 생성 가능)

## 서비스 장점

- ChatGPT 서비스를 구독 비용(20+2$)만큼 사용하지 않는다면?  
    => API KEY를 등록하고 사용한 만큼만 지불하자.
  
- ChatGPT는 별도 옵션을 해제하지 않으면 대화 기록을 학습에 사용한다.  
    => API로 요청한 대화는 학습에 사용되지 않는다.  

- 채팅 기록을 ChatGPT 플랫폼이 아닌 로컬DB에 저장할 수 있다.

- 사용되는 토큰량을 시각적으로 확인하고, 효율적인 대화 방법을 생각할 수 있다.

## Tech Stack
- Front-end - TS, React, MUI, React-Query
- Back-end - Express
- DB - SQLite3
- DevOps - Docker

## Usage Sample Images
![1](./readme_img/1.png)
최초 실행시에 db가 생성되고, 그곳에 채팅 기록과 세팅값들이 저장됩니다.

![1](./readme_img/2.png)  
openai-api-key - API KEY 등록이 필요합니다.  
Model - 기존의 모델을 선택하거나, 새로운 버전이 출시됐을 때 모델명을 입력하여 사용할 수 있습니다.  
maximum send message count - 질문에 올 응답을 제외한 고려되는 채팅 수 입니다.  
```
// maximum send message count example
question 1. 안녕?
answer 1. 안녕하세요!😊, 어떻게 도와드릴까요?
question 2. 오늘 대한민국 날씨를 알려줘
answer 2. 
오늘 대한민국의 날씨를 알려드릴게요! 😊
최신 날씨 정보를 위해 특정 지역을 말씀해 주시면 더 정확한 정보를 제공해 드릴 수 있어요.
어느 지역의 날씨가 궁금하신가요? ☁🌞🌧

위 대화에서 count=3 이라면 question 2. 를 요청할 때, 다음과 같은 history가 보내지고
history = [question 1. + answer 1. + question 2.] 

총 사용되는 토큰량은 다음과 같다.
question 1. + answer 1. + question 2. + answer 2.
```

![1](./readme_img/3.png)
API 응답을 받으면 대화 박스 옆에 토큰량이 나타납니다.  
질문 옆에 토큰량은 history(보낸 거 포함)의 총합이고  
답변 옆에 토큰량은 답변 하나에 대한 값입니다.

![1](./readme_img/4.png)
토큰량 숫자를 클릭하면, 주고받은 채팅 범위, 토큰량 등을 확인할 수 있습니다.

![1](./readme_img/5.png)  
채팅방을 삭제할 수 있습니다.  

상단에 보이는 이미지 아이콘을 클릭하면 이미지 생성형AI 페이지로 이동합니다.  

---
![1](./readme_img/6.png) 
prompt를 입력하고, 생성할 이미지 사이즈와 Quality를 선택합니다.  

Revised Prompt는 이미지 생성에 최종적으로 사용된 Prompt입니다.  
(더 좋은 결과를 위해 입력한 Prompt가 수정된 결과입니다.)