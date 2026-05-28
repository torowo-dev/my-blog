---
title: JavaScript 이벤트 리스너 이해하기
date: 2026-05-29
---

버튼을 클릭하거나 키보드를 눌렀을 때 무언가가 일어나는 건, 모두 이벤트 리스너 덕분이다.

## addEventListener 기본 사용법

```js
const btn = document.querySelector('#my-btn');
btn.addEventListener('click', () => {
  console.log('버튼이 눌렸다!');
});
```

`addEventListener`는 세 가지를 받는다: **대상 요소**, **이벤트 이름**, **실행할 함수**.

## 자주 쓰는 이벤트

- `click` — 마우스 클릭
- `keydown` — 키보드 키를 누를 때
- `submit` — 폼 제출
- `input` — 입력 필드 값 변경

## 이벤트 객체 활용

콜백 함수는 첫 번째 인자로 이벤트 객체를 받는다. 어떤 키가 눌렸는지, 어느 요소가 클릭됐는지 등을 알 수 있다.

```js
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    console.log('엔터 키 눌림');
  }
});
```

> 폼 제출 시 페이지가 새로고침되는 걸 막으려면 `e.preventDefault()`를 호출한다.

## 리스너 제거하기

등록한 리스너는 `removeEventListener`로 제거할 수 있다. 단, **같은 함수 참조**를 넘겨야 한다.

```js
function handleClick() { console.log('클릭'); }

btn.addEventListener('click', handleClick);
btn.removeEventListener('click', handleClick); // 제거
```

이벤트 리스너 하나만 잘 써도 대부분의 사용자 인터랙션을 처리할 수 있다.
