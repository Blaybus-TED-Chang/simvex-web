# 작업 규칙

- 구조가 복잡해지고 코드가 많아지고 있으니, 매번 작업을 시작할 때 Serena MCP를 활용하여 코드를 꼼꼼히 파악할 것
- 기능을 추가하거나 수정, 삭제할 때 영향이 가는 부분을 꼼꼼하게 파악하고 작업을 진행할 것
- 한글로 대화할 것
- 커밋은 사용자가 요청할 때만 수행할 것
- 서브에이전트(general-purpose, Explore) 호출 시, 파일 탐색이 많은 작업이면 Serena MCP 우선 사용을 프롬프트에 명시할 것
  - `get_symbols_overview`, `find_symbol`, `search_for_pattern` 우선 사용
  - 파일 전체 Read 최소화
