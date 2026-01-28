# 🧪 UTOPIA X AI 매칭 시스템 테스트 케이스

## 📋 개요
이 문서는 **확장된 아티스트 프로필 시스템**의 AI 매칭 정확도를 검증하기 위한 7가지 실전 시나리오입니다.

---

## 🎯 Test Case 1: 럭셔리 패션쇼 모델 섭외
### 클라이언트 요청
```
샤넬 SS24 패션쇼를 위한 댄서 섭외합니다. 
키 175cm 이상의 늘씬한 모델형 댄서가 필요하며, 
우아하고 절제된 무브먼트가 중요합니다. 
럭셔리 브랜드 경험자 우대.
```

### 예상 AI 분석 결과
```javascript
{
  "hardFilters": {
    "heightCm": { "min": 175, "max": null },
    "bodyFrame": null,
    "silhouette": "slender"
  },
  "softScores": {
    "tag_elegant": 0.95,
    "tag_calm": 0.9,
    "tag_soft": 0.85,
    "tag_classic": 0.8,
    "tag_mature": 0.75,
    "tag_tall": 0.95
  }
}
```

### 매칭 조건
- ✅ 키 175cm 이상 (hardFilter)
- ✅ elegant, calm, soft 태그 높은 댄서
- ✅ 늘씬한 실루엣
- ⚠️ 우선순위: 비주얼 > 스타일 > 기술력

---

## 🎯 Test Case 2: 귀엽고 금발 여성 댄서 (캐치 티니핑 뮤지컬)
### 클라이언트 요청
```
캐치 티니핑 싱어롱 뮤지컬에 참여할 여성 댄서를 찾습니다.
귀엽고 금발 머리에 어린이와 잘 소통할 수 있는 분이면 좋겠습니다.
연기력과 가창력이 춤보다 중요하고, 캐릭터 연기 경험 필수입니다.
```

### 예상 AI 분석 결과
```javascript
{
  "hardFilters": {
    "gender": "female",
    "hairColor": ["blonde"],
    "kidsFriendly": true,
    "actingMin": 60,
    "singingMin": 50
  },
  "softScores": {
    "tag_cute": 0.95,
    "tag_fresh": 0.9,
    "tag_energetic": 0.85,
    "tag_young": 0.8,
    "acting": 0.9,
    "emotionalActing": 0.85,
    "singing": 0.8,
    "facialExpression": 0.85,
    "characterActing": 0.9
  }
}
```

### 매칭 조건
- ✅ 여성 댄서 (hardFilter)
- ✅ 금발 (hardFilter)
- ✅ 어린이 친화 (hardFilter)
- ✅ 연기력 60 이상 (hardFilter)
- ✅ 가창력 50 이상 (hardFilter)
- ✅ 귀여운 분위기 (softScore)
- ⚠️ 우선순위: 연기/노래 > 춤

---

## 🎯 Test Case 3: 할로윈 공포 이벤트 댄서
### 클라이언트 요청
```
할로윈 좀비 공포 이벤트를 진행합니다.
특수분장 가능하고 호러 연출에 거부감이 없는 댄서가 필요합니다.
다크하고 실험적인 무브먼트를 선호하며, 
놀라게 하는 연기와 점프 스케어가 중요합니다.
```

### 예상 AI 분석 결과
```javascript
{
  "hardFilters": {
    "sfxMakeupOk": true,
    "horrorReady": true
  },
  "softScores": {
    "tag_dark": 0.95,
    "tag_experimental": 0.9,
    "tag_powerful": 0.85,
    "acting": 0.85,
    "emotionalActing": 0.8,
    "facialExpression": 0.9,
    "characterActing": 0.85
  }
}
```

### 매칭 조건
- ✅ 특수분장 가능 (hardFilter)
- ✅ 호러 연출 가능 (hardFilter)
- ✅ 다크/실험적 분위기 (softScore)
- ✅ 연기력 중요 (softScore)
- ⚠️ 우선순위: 호러 적합성 > 연기력 > 춤

---

## 🎯 Test Case 4: 리그오브레전드 코스프레 댄서
### 클라이언트 요청
```
LOL 챔피언스 코리아 오프닝을 위한 코스프레 댄서를 찾습니다.
리그오브레전드 캐릭터 지식이 풍부하고 
코스프레 경험이 있는 게이머 댄서 선호합니다.
LED 의상 착용 가능하고 미래지향적인 분위기의 퍼포먼스가 필요합니다.
```

### 예상 AI 분석 결과
```javascript
{
  "hardFilters": {
    "cosplayExperience": true,
    "gamerNerd": true,
    "willingToWearLED": true
  },
  "softScores": {
    "tag_energetic": 0.9,
    "tag_powerful": 0.85,
    "tag_trendy": 0.85,
    "futuristicVibe": 0.95,
    "tag_technical": 0.8,
    "highEnergy": 0.9
  }
}
```

### 매칭 조건
- ✅ 코스프레 경험 (hardFilter)
- ✅ 게이머/너드 지식 (hardFilter)
- ✅ LED 의상 가능 (hardFilter)
- ✅ 미래지향적/에너지 넘치는 분위기 (softScore)
- ⚠️ 우선순위: 게이머 지식 > 코스프레 경험 > 춤

---

## 🎯 Test Case 5: 국악 X 현대무용 융합 공연
### 클라이언트 요청
```
국립극장 현대무용단 특별 공연에 참여할 댄서를 모집합니다.
한국 전통춤 기반의 현대적 해석이 필요하며,
한복 및 전통 의상 착용 경험 우대합니다.
우아하고 절제된 움직임과 높은 기술력이 중요합니다.
```

### 예상 AI 분석 결과
```javascript
{
  "hardFilters": {
    "specialCostumeExperience": "hanbok"
  },
  "softScores": {
    "koreanTraditional": 0.95,
    "tag_elegant": 0.9,
    "tag_calm": 0.85,
    "tag_classic": 0.8,
    "traditionalModern": 0.3,  // low value = traditional
    "tag_technical": 0.85,
    "tag_soft": 0.8
  }
}
```

### 매칭 조건
- ✅ 한복 경험 (hardFilter)
- ✅ 한국 전통춤 스킬 높음 (softScore)
- ✅ 우아하고 절제된 스타일 (softScore)
- ✅ 기술력 높음 (softScore)
- ⚠️ 우선순위: 전통춤 실력 > 기술력 > 스타일

---

## 🎯 Test Case 6: 로보팅 특화 힙합 공연
### 클라이언트 요청
```
스트릿 댄스 배틀 쇼케이스에 로보팅 전문 댄서를 찾습니다.
기계적이고 정교한 무브먼트가 핵심이며,
애니메이션이나 터팅 등 복합 스킬 보유자 우대합니다.
남성, 탄탄한 체형, 강렬한 에너지가 필요합니다.
```

### 예상 AI 분석 결과
```javascript
{
  "hardFilters": {
    "gender": "male",
    "bodyFrame": "athletic"
  },
  "softScores": {
    "roboting": 0.95,
    "animation": 0.85,
    "tutting": 0.8,
    "organicRobotic": 0.95,  // high = robotic
    "tag_powerful": 0.9,
    "tag_technical": 0.9,
    "tag_street": 0.85,
    "highEnergy": 0.9
  }
}
```

### 매칭 조건
- ✅ 남성 댄서 (hardFilter)
- ✅ 애슬레틱 체형 (hardFilter)
- ✅ 로보팅 스킬 높음 (softScore)
- ✅ 기계적 움직임 (softScore)
- ⚠️ 우선순위: 로보팅 스킬 > 특수 스킬 > 에너지

---

## 🎯 Test Case 7: 키즈 댄스 강사 모집
### 클라이언트 요청
```
유아 및 초등학생 대상 댄스 강사를 모집합니다.
어린이 친화적이고 밝은 성격의 강사가 필요하며,
강의 경험과 커뮤니케이션 스킬이 중요합니다.
춤보다는 티칭 능력과 친화력을 우선시합니다.
```

### 예상 AI 분석 결과
```javascript
{
  "hardFilters": {
    "canTeach": true,
    "kidsFriendly": true
  },
  "softScores": {
    "approachability": 0.95,
    "communicationSkill": 0.9,
    "simplifyAbility": 0.85,
    "tag_fresh": 0.85,
    "tag_energetic": 0.9,
    "tag_cute": 0.75,
    "kidsFriendly": 0.95
  }
}
```

### 매칭 조건
- ✅ 강사 가능 (hardFilter)
- ✅ 어린이 친화 (hardFilter)
- ✅ 친화력/커뮤니케이션 높음 (softScore)
- ✅ 밝고 에너지 넘치는 분위기 (softScore)
- ⚠️ 우선순위: 티칭 능력 > 성격 > 춤 실력

---

## 📊 테스트 방법

### 1. 수동 테스트
각 테스트 케이스의 요청 텍스트를 **댄서 섭외 신청 폼**에 입력하고:
1. AI가 분석한 `hardFilters`와 `softScores` 확인
2. 추천된 댄서가 예상 조건과 일치하는지 확인
3. 매칭 점수가 합리적인지 검증

### 2. 자동 테스트 (향후 구현)
```javascript
const testCases = [
  { prompt: "...", expectedFilters: {...}, expectedScores: {...} },
  // ...
];

testCases.forEach(tc => {
  const result = simulateAIAnalysis(tc.prompt);
  assert.deepEqual(result.hardFilters, tc.expectedFilters);
  assert.similarScores(result.softScores, tc.expectedScores, 0.1);
});
```

---

## ✅ 검증 체크리스트

- [ ] Test Case 1: 럭셔리 패션쇼 - 키 필터와 우아한 스타일 우선 매칭
- [ ] Test Case 2: 티니핑 뮤지컬 - 금발+여성+어린이친화+연기력 복합 필터
- [ ] Test Case 3: 할로윈 이벤트 - 특수분장+호러 필터, 다크 분위기 우선
- [ ] Test Case 4: LOL 코스프레 - 게이머+코스프레+LED 복합 조건
- [ ] Test Case 5: 국악 융합 - 전통춤 스킬과 한복 경험 매칭
- [ ] Test Case 6: 로보팅 공연 - 로봇 스킬과 기계적 움직임 우선
- [ ] Test Case 7: 키즈 강사 - 티칭 능력과 친화력 우선, 춤 실력 하위

---

## 🚀 다음 단계

1. **실제 댄서 데이터 추가**: 각 테스트 케이스에 맞는 댄서 프로필 생성
2. **OpenAI API 연동**: 실제 LLM으로 텍스트 분석 정확도 향상
3. **가중치 튜닝**: 실제 섭외 결과 피드백으로 매칭 알고리즘 개선
4. **UI 개선**: 매칭 결과에 hardFilter 통과 여부 명시

---

**작성일**: 2026-01-28  
**버전**: v1.0  
**작성자**: UTOPIA X Development Team
