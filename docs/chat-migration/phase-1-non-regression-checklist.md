# Phase 1 Non-Regression Checklist

Use this checklist during Phase 2+ extraction and after each integration step.

## A. Streaming behavior parity
- [ ] Stream starts with assistant placeholder message before first token.
- [ ] Tokens append incrementally in order to the same assistant message.
- [ ] Final rendered assistant content matches completed stream output.
- [ ] Abort cancels streaming immediately and clears streaming state.
- [ ] Abort does not append generic assistant error message.
- [ ] Non-abort failures append user-friendly assistant fallback message.

## B. Conversation/session identity parity
- [ ] If session has no conversationId, one is created before/at first stream.
- [ ] conversationId is persisted onto active session when resolved.
- [ ] Sending first message in New chat updates title from input preview.
- [ ] Local session remains intact when transitioning to server-backed session.

## C. History/content parity
- [ ] Session metadata list loads from backend.
- [ ] Session content is lazy-loaded on first session open.
- [ ] Content cache avoids redundant requests for same conversation.
- [ ] force refresh bypasses cache and replaces messages.
- [ ] invalidateSessionContent(conversationId) invalidates single cache entry.
- [ ] invalidateSessionContent() invalidates all caches.
- [ ] Rename session updates local state and attempts backend rename.
- [ ] Delete session updates local state and attempts backend delete.
- [ ] Deleting current active session selects a valid fallback session.

## D. Dashboard UI behavior stability
- [ ] Open/close chat button behavior in layout remains unchanged.
- [ ] Desktop fullscreen toggle behavior remains unchanged.
- [ ] Mobile chat always opens fullscreen behavior remains unchanged.
- [ ] Resizable panel size behavior remains unchanged on desktop.
- [ ] Quick Learn still opens chat in fullscreen and seeds prompt.

## E. TestReviewPage behavior stability
- [ ] AI Help opens panel exactly as before.
- [ ] Fullscreen toggle and mobile viewport lock behavior unchanged.
- [ ] Session switch still loads history correctly.
- [ ] Question reference badges and prompt prefix behavior unchanged.
- [ ] Existing explanation rendering remains compatible with stream output.

## F. Cross-feature architecture constraints
- [ ] Shared logic lives in src/features/chat only for reusable parts.
- [ ] Practice and dashboard consume shared logic through public exports only.
- [ ] Practice-only reference logic remains in practice feature.
- [ ] No direct cross-feature internal-file imports introduced.

## Manual test matrix
- [ ] Dashboard: send prompt, observe token streaming, close/reopen panel, verify history.
- [ ] Dashboard: switch sessions during stream, verify no token bleed.
- [ ] Practice: send prompt with references, verify response and references intact.
- [ ] Practice: rename/delete session, reload history, verify consistency.
