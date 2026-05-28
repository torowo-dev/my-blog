---
title: CSS Flexbox로 레이아웃 잡기
date: 2026-05-28
---

요소를 가로로 나란히 놓거나 가운데 정렬할 때, Flexbox를 쓰면 훨씬 간결해진다.

## 기본 사용법

부모 요소에 `display: flex`를 선언하는 것만으로 Flexbox가 활성화된다. 자식 요소들은 자동으로 한 줄에 나란히 배치된다.

```css
.container {
  display: flex;
  gap: 16px;
}
```

## 주축과 교차축

Flexbox는 두 방향을 기준으로 동작한다.

- **주축(main axis):** 아이템이 배치되는 방향. 기본값은 가로(`row`).
- **교차축(cross axis):** 주축과 수직인 방향.

`flex-direction: column`으로 바꾸면 세로 방향이 주축이 된다.

## 자주 쓰는 속성

`justify-content`는 주축 방향 정렬, `align-items`는 교차축 방향 정렬을 담당한다. `flex-wrap: wrap`을 추가하면 아이템이 넘칠 때 자동으로 다음 줄로 내려간다.

> 가운데 정렬은 `justify-content: center`와 `align-items: center`를 함께 쓰면 된다.

```css
.centered {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

Flexbox 하나만 익혀도 대부분의 레이아웃 문제가 깔끔하게 해결된다.
