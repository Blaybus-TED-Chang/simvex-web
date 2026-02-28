---
name: commit
description: 변경사항을 검토하고 git commit을 생성합니다
disable-model-invocation: true
allowed-tools: Bash(git status), Bash(git diff), Bash(git log:*), Bash(git add:*), Bash(git commit:*)
---

변경된 파일을 확인하고 git commit을 생성하세요.

1. `git status`로 변경 파일 목록 확인
2. `git diff`로 변경 내용 확인
3. `git log --oneline -5`로 최근 커밋 메시지 스타일 확인
4. 변경사항에 맞는 커밋 메시지 작성 (한글, `[Feat]` / `[Fix]` / `[Refactor]` 등 prefix 사용)
5. 관련 파일만 선택적으로 `git add`
6. 아래 형식으로 커밋:

```
git commit -m "$(cat <<'EOF'
[Prefix] 커밋 메시지

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

7. `git status`로 커밋 완료 확인

주의: 사용자가 명시적으로 요청하지 않으면 push하지 마세요.
