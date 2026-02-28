---
name: push
description: 현재 브랜치를 원격 저장소에 push합니다
disable-model-invocation: true
allowed-tools: Bash(git status), Bash(git log:*), Bash(git push:*)
---

현재 브랜치를 원격 저장소에 push하세요.

1. `git status`로 커밋되지 않은 변경사항이 없는지 확인
2. 커밋되지 않은 변경사항이 있으면 사용자에게 알리고 중단
3. `git log --oneline -3`으로 push할 커밋 내용 확인 후 사용자에게 안내
4. `git push` 실행
5. 성공 여부 확인 후 결과 안내
