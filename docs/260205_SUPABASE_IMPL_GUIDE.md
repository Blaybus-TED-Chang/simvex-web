# Supabase 유저 기능 구현 가이드

## 현재 진행 상황

### 완료됨
- [x] `npm install @supabase/supabase-js @supabase/ssr` (패키지 설치)
- [x] 디렉토리 생성 (`src/lib/supabase/`, `src/hooks/`, `src/components/auth/`, `src/app/auth/`)
- [x] `src/lib/supabase/client.ts` 생성

### 미완료
- [ ] `src/lib/supabase/server.ts`
- [ ] `src/lib/supabase/middleware.ts`
- [ ] `src/middleware.ts`
- [ ] `src/hooks/useUser.ts`
- [ ] `src/components/auth/AuthButton.tsx`
- [ ] `src/app/auth/login/page.tsx`
- [ ] `src/app/auth/callback/route.ts`
- [ ] `src/hooks/useSupabaseNotes.ts`
- [ ] `src/hooks/useSupabaseChat.ts`
- [ ] `src/app/page.tsx` 수정 (AuthButton 추가)
- [ ] `src/app/viewer/[model]/page.tsx` 수정 (AuthButton + user 전달)
- [ ] `src/components/viewer/NotesPanel.tsx` 수정 (Supabase 연동)
- [ ] `src/lib/store/viewerStore.ts` 수정 (모델별 노트)

---

## 사전 준비 (유저가 직접 해야 할 것)

### 1. Supabase 프로젝트 생성
1. [supabase.com](https://supabase.com) → New Project
2. Region: `Northeast Asia (Tokyo)`

### 2. `.env.local`에 환경변수 추가
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...
```

### 3. Supabase SQL Editor에서 테이블 생성
```sql
-- 유저별 노트 (모델별 1개)
CREATE TABLE user_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  model_id TEXT NOT NULL,
  content TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, model_id)
);
ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_notes_select" ON user_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_notes_insert" ON user_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_notes_update" ON user_notes FOR UPDATE USING (auth.uid() = user_id);

-- 유저별 AI 대화 (모델별 1개, messages는 JSONB 배열)
CREATE TABLE chat_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  model_id TEXT NOT NULL,
  messages JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, model_id)
);
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_chat_select" ON chat_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_chat_insert" ON chat_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_chat_update" ON chat_conversations FOR UPDATE USING (auth.uid() = user_id);
```

---

## 신규 파일 생성 (9개 남음)

### 파일 1: `src/lib/supabase/server.ts`
```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component에서 호출 시 무시
          }
        },
      },
    }
  );
}
```

### 파일 2: `src/lib/supabase/middleware.ts`
```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 세션 갱신 (중요: getUser를 호출해야 세션이 갱신됨)
  await supabase.auth.getUser();

  return supabaseResponse;
}
```

### 파일 3: `src/middleware.ts`
```typescript
import { updateSession } from '@/lib/supabase/middleware';
import { type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // 정적 파일과 GLB 모델 제외
    '/((?!_next/static|_next/image|favicon.ico|models/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|glb|gltf)$).*)',
  ],
};
```

### 파일 4: `src/hooks/useUser.ts`
```typescript
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // 현재 유저 가져오기
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}
```

### 파일 5: `src/components/auth/AuthButton.tsx`
```tsx
'use client';

import { useUser } from '@/hooks/useUser';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function AuthButton() {
  const { user, loading } = useUser();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  if (loading) {
    return (
      <div className="h-9 w-20 bg-gray-700 rounded-lg animate-pulse" />
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400 hidden sm:inline">
          {user.email}
        </span>
        <button
          onClick={handleSignOut}
          className="px-3 py-1.5 text-sm text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
        >
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => router.push('/auth/login')}
      className="px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
    >
      로그인
    </button>
  );
}
```

### 파일 6: `src/app/auth/login/page.tsx`
```tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const supabase = createClient();

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage('확인 이메일을 보냈습니다. 이메일을 확인해주세요.');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        router.push('/');
        router.refresh();
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* 로고 */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-xl font-bold text-white">S</span>
            </div>
            <span className="text-xl font-bold text-white">SiMVEX</span>
          </Link>
        </div>

        {/* 폼 카드 */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6 text-center">
            {isSignUp ? '회원가입' : '로그인'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="6자 이상"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {message && (
              <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
                <p className="text-sm text-green-400">{message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {loading ? '처리 중...' : isSignUp ? '회원가입' : '로그인'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setMessage(null);
              }}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              {isSignUp ? '이미 계정이 있나요? 로그인' : '계정이 없나요? 회원가입'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 파일 7: `src/app/auth/callback/route.ts`
```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(origin);
}
```

### 파일 8: `src/hooks/useSupabaseNotes.ts`
```typescript
'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export function useSupabaseNotes(user: User | null, modelId: string) {
  const [notes, setNotes] = useState('');
  const [loaded, setLoaded] = useState(false);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // DB에서 노트 로드
  useEffect(() => {
    if (!user || !modelId) {
      setLoaded(true);
      return;
    }

    const supabase = createClient();
    supabase
      .from('user_notes')
      .select('content')
      .eq('user_id', user.id)
      .eq('model_id', modelId)
      .single()
      .then(({ data }) => {
        if (data) setNotes(data.content || '');
        setLoaded(true);
      });
  }, [user, modelId]);

  // 1초 디바운스 저장
  const saveNotes = useCallback(
    (content: string) => {
      setNotes(content);

      if (!user || !modelId) return;

      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        const supabase = createClient();
        await supabase.from('user_notes').upsert(
          {
            user_id: user.id,
            model_id: modelId,
            content,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,model_id' }
        );
      }, 1000);
    },
    [user, modelId]
  );

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  return { notes, saveNotes, loaded };
}
```

### 파일 9: `src/hooks/useSupabaseChat.ts`
```typescript
'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function useSupabaseChat(user: User | null, modelId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loaded, setLoaded] = useState(false);

  // DB에서 대화 로드
  useEffect(() => {
    if (!user || !modelId) {
      setLoaded(true);
      return;
    }

    const supabase = createClient();
    supabase
      .from('chat_conversations')
      .select('messages')
      .eq('user_id', user.id)
      .eq('model_id', modelId)
      .single()
      .then(({ data }) => {
        if (data && Array.isArray(data.messages)) {
          setMessages(data.messages as ChatMessage[]);
        }
        setLoaded(true);
      });
  }, [user, modelId]);

  // 대화 저장
  const saveMessages = useCallback(
    async (msgs: ChatMessage[]) => {
      setMessages(msgs);

      if (!user || !modelId) return;

      const supabase = createClient();
      await supabase.from('chat_conversations').upsert(
        {
          user_id: user.id,
          model_id: modelId,
          messages: msgs,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,model_id' }
      );
    },
    [user, modelId]
  );

  // 대화 초기화
  const clearMessages = useCallback(async () => {
    setMessages([]);

    if (!user || !modelId) return;

    const supabase = createClient();
    await supabase
      .from('chat_conversations')
      .delete()
      .eq('user_id', user.id)
      .eq('model_id', modelId);
  }, [user, modelId]);

  return { messages, saveMessages, clearMessages, loaded };
}
```

---

## 기존 파일 수정 (4개)

### 수정 1: `src/app/page.tsx`

헤더에 AuthButton 추가:

```diff
 import Link from 'next/link';
 import { useState } from 'react';
 import { models, combinedModels } from '@/data/models';
+import { AuthButton } from '@/components/auth/AuthButton';

 // ... (simulations 배열은 그대로)

 export default function Home() {
   // ...
   return (
     <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white">
       <header className="pt-8 pb-4 px-6">
-        <div className="max-w-6xl mx-auto flex items-center gap-4">
+        <div className="max-w-6xl mx-auto flex items-center justify-between">
+          <div className="flex items-center gap-4">
             <div className="w-12 h-12 ...">
               <span className="text-2xl font-bold">S</span>
             </div>
             <div>
               <h1 className="text-2xl font-bold">SiMVEX</h1>
               <p className="text-sm text-gray-400">Engineering Simulation Platform</p>
             </div>
+          </div>
+          <AuthButton />
         </div>
       </header>
```

**구체적 변경:**
- import 추가: `import { AuthButton } from '@/components/auth/AuthButton';`
- `<div className="max-w-6xl mx-auto flex items-center gap-4">` →
  `<div className="max-w-6xl mx-auto flex items-center justify-between">`
- 로고+텍스트를 `<div className="flex items-center gap-4">...</div>`로 감싸기
- 닫힌 div 뒤에 `<AuthButton />` 추가

### 수정 2: `src/app/viewer/[model]/page.tsx`

```diff
 import { NotesPanel } from '@/components/viewer/NotesPanel';
+import { AuthButton } from '@/components/auth/AuthButton';
+import { useUser } from '@/hooks/useUser';

 export default function ViewerPage() {
   const params = useParams();
   const modelId = params.model as string;
+  const { user } = useUser();

   // ... (기존 코드 그대로)

   // 헤더 우측 버튼 영역에 AuthButton 추가
   <div className="flex items-center gap-2">
+    <AuthButton />
     {/* 디버그 모드 토글 */}

   // NotesPanel에 user와 modelId 전달
   <NotesPanel
     modelInfo={currentModelInfo}
     selectedPart={selectedPart}
+    user={user}
+    modelId={modelId}
   />
```

### 수정 3: `src/components/viewer/NotesPanel.tsx`

주요 변경사항:
- props에 `user`, `modelId` 추가
- `useSupabaseNotes`, `useSupabaseChat` 훅 연동
- 비로그인 시 기존 localStorage 동작 유지
- 로그인 시 Supabase 저장

```diff
+import { useSupabaseNotes } from '@/hooks/useSupabaseNotes';
+import { useSupabaseChat } from '@/hooks/useSupabaseChat';
+import type { User } from '@supabase/supabase-js';

 interface NotesPanelProps {
   modelInfo?: ModelInfo | null;
   selectedPart?: PartInfo | null;
+  user?: User | null;
+  modelId?: string;
 }

-export function NotesPanel({ modelInfo, selectedPart }: NotesPanelProps) {
+export function NotesPanel({ modelInfo, selectedPart, user, modelId }: NotesPanelProps) {
   const [activeTab, setActiveTab] = useState<TabType>('notes');
-  const { notes, setNotes } = useViewerStore();
+  const localStore = useViewerStore();
+
+  // Supabase 훅 (user가 있을 때만 활성)
+  const supabaseNotes = useSupabaseNotes(user ?? null, modelId ?? '');
+  const supabaseChat = useSupabaseChat(user ?? null, modelId ?? '');
+
+  // 로그인 시 Supabase, 비로그인 시 localStorage
+  const notes = user ? supabaseNotes.notes : localStore.notes;
+  const setNotes = user ? supabaseNotes.saveNotes : localStore.setNotes;

   // AI 채팅 상태
-  const [messages, setMessages] = useState<ChatMessage[]>([]);
+  const messages = user ? supabaseChat.messages : localMessages;
+  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
```

**AI 채팅 sendMessage 함수 수정:**
```diff
     const assistantMessage: ChatMessage = {
       role: 'assistant',
       content: data.message,
     };

-    setMessages((prev) => [...prev, assistantMessage]);
+    const updated = [...messages, userMessage, assistantMessage];
+    // 주의: userMessage는 이미 추가되어 있으므로 assistantMessage만 추가
+    if (user) {
+      // messages에 이미 userMessage가 들어간 상태이므로 assistantMessage만 추가
+      supabaseChat.saveMessages([...messages, assistantMessage]);
+    } else {
+      setLocalMessages((prev) => [...prev, assistantMessage]);
+    }
```

**대화 초기화 수정:**
```diff
   const clearChat = () => {
-    setMessages([]);
+    if (user) {
+      supabaseChat.clearMessages();
+    } else {
+      setLocalMessages([]);
+    }
     setError(null);
   };
```

### 수정 4: `src/lib/store/viewerStore.ts`

변경 없음 (노트는 Supabase 훅에서 모델별로 관리하므로 기존 localStorage 로직 유지).

---

## 핵심 동작 방식 요약

| 상태 | 노트 저장 | 채팅 저장 |
|------|----------|----------|
| 비로그인 | localStorage (기존) | 메모리 (휘발, 기존) |
| 로그인 | Supabase `user_notes` 테이블 | Supabase `chat_conversations` 테이블 |

- **노트**: 1초 디바운스 자동 저장
- **채팅**: AI 응답 수신 후 즉시 저장
- **미들웨어**: 모든 요청에서 세션 자동 갱신 (정적 파일/GLB 제외)

---

## 구현 시 Claude에게 내릴 지시

```
이 프로젝트에 Supabase 유저 기능을 구현해주세요.
SUPABASE_IMPL_GUIDE.md 파일을 참고하여 미완료된 항목을 순서대로 구현해주세요.
이미 완료된 항목은 건너뛰세요.
```

---

## 빌드 검증

모든 파일 생성/수정 후:
```bash
cd simvex && npm run build
```

빌드 에러 시 타입 오류 위주로 수정.
