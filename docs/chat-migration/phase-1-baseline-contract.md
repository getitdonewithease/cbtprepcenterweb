# Phase 1 Baseline Contract: Shared Chat Core Migration

## Purpose
This document freezes current behavior before extraction so we can migrate only the shared core safely.

Scope frozen here:
- Shared API streaming logic
- Shared chat history/content orchestration

Out of scope for shared extraction:
- Feature-specific UI layout and interactions
- Practice-only question-reference presentation semantics

## Authoritative Sources
- src/features/practice/api/practiceApi.ts
- src/features/practice/hooks/useAIChat.ts
- src/features/practice/hooks/useAIChatHistory.ts
- src/features/practice/hooks/useAIChatSession.ts
- src/features/practice/ui/AIChatPanel.tsx
- src/features/practice/ui/TestReviewPage.tsx
- src/components/common/Layout.tsx

## Shared-Core Contract

### 1. Streaming transport contract (must preserve)
From src/features/practice/api/practiceApi.ts:
- Streaming endpoint is POST /api/v1/ai/chat/stream with payload { prompt, chatId }.
- chatId is resolved from options.conversationId, else created via createChatSession().
- Access token is attached as Bearer token if available.
- Response body is read as stream chunks and parsed line-by-line.
- [DONE] marker terminates streaming loop.
- Each content chunk is appended to accumulated content and emitted through onToken.
- onComplete receives the final accumulated content after stream ends.
- Returned object includes explanation and conversationId.

Invariant:
- Streaming emits incremental updates in order and final content equals concatenation of emitted chunks (plus complete override if backend sends terminal final text).

### 2. Stream orchestration contract (must preserve)
From src/features/practice/hooks/useAIChat.ts:
- streamMessage(prompt):
  - Aborts any previous stream before starting a new one.
  - Emits assistant placeholder message start via onAssistantMessageStart.
  - Resolves conversationId lazily if missing.
  - Emits token updates through onAssistantMessageToken(messageId, nextContent, chunk).
  - Emits completion through onAssistantMessageComplete(messageId, response).
- Hook state:
  - isStreaming true only during active stream.
  - streamingMessageId tracks active assistant message id.
  - abortStream() aborts and clears streaming state.
- Abort behavior:
  - AbortError is propagated and should not be rendered as a normal assistant failure message.

Invariant:
- Only one active stream per hook instance.

### 3. Session/history metadata contract (must preserve)
From src/features/practice/hooks/useAIChatHistory.ts and useAIChatSession.ts:
- Metadata operations:
  - refetchMetadata() loads sessions from backend.
  - deleteSession(conversationId), renameSession(conversationId, title).
- Content operations:
  - getSessionContent(conversationId, { force? }) supports cache and de-duplicates in-flight request per conversation.
  - invalidateSessionContent(conversationId?) clears one or all caches.
- Session state operations:
  - createSession() creates local session with conversationId null and title New chat.
  - hydrateSessions() merges server metadata with local sessions preserving local messages where needed.
  - appendMessage, updateMessage, replaceMessages update session content immutably and update timestamps.
  - deleteSession(sessionId) guarantees at least one session remains.

Invariant:
- Session identity can transition from local-only to server-backed via conversationId without losing local message continuity.

### 4. Current dashboard chat baseline (for migration target)
From src/components/common/Layout.tsx:
- Current dashboard chat message flow is local-only stubbed assistant response.
- Chat fullscreen/open/close/resizable behavior must remain unchanged when shared core is plugged in.

Invariant:
- UI behaviors stay stable while logic beneath changes from stub to streaming/history-backed core.

## Non-goals for Phase 1 and shared core extraction
- Rewriting ChatPanelBase or general chat UI styling.
- Reworking TestReviewPage fullscreen/viewport orchestration.
- Changing question-reference composition semantics in practice.

## Risks to guard against
- Token bleed into wrong session when switching sessions mid-stream.
- Losing local messages during metadata hydration.
- Breaking abort path and showing false error messages.
- Changing timing of refetch/invalidate causing stale history.

## Phase-1 Exit Criteria
- Contract accepted and used as implementation guardrails.
- Non-regression checklist completed and stored.
