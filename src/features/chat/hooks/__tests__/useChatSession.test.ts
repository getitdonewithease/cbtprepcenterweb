import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useChatSession } from "../useChatSession";
import type { ChatMessage } from "../../types/chatTypes";
import type { ChatSession, ChatSessionMetadata } from "../../types/chatHistoryTypes";

type TestMessage = ChatMessage;
type TestSession = ChatSession<TestMessage>;
type TestMetadata = ChatSessionMetadata;

const createMockSession = (id = "local-1", conversationId: string | null = null): TestSession => ({
  id,
  title: "New chat",
  createdAt: new Date(),
  updatedAt: Date.now(),
  conversationId,
  messages: [],
});

describe("useChatSession Hook (Tier 1 Unit Test)", () => {
  it("keeps callbacks (hydrateSessions, createSession) referentially stable when options object changes on re-render", () => {
    let renderCount = 0;

    const { result, rerender } = renderHook(() => {
      renderCount += 1;
      return useChatSession<TestMessage, TestSession, TestMetadata>({
        createInitialSession: () => createMockSession(`session-${renderCount}`),
      });
    });

    const initialHydrate = result.current.hydrateSessions;
    const initialCreate = result.current.createSession;
    const initialDelete = result.current.deleteSession;

    // Trigger re-render with a new options object literal
    rerender();

    expect(result.current.hydrateSessions).toBe(initialHydrate);
    expect(result.current.createSession).toBe(initialCreate);
    expect(result.current.deleteSession).toBe(initialDelete);
  });

  it("hydrates server sessions and preserves existing loaded messages", () => {
    const { result } = renderHook(() =>
      useChatSession<TestMessage, TestSession, TestMetadata>({
        createInitialSession: () => createMockSession(),
      })
    );

    const serverMetadata: TestMetadata[] = [
      {
        id: "chat-conv-1",
        title: "Server Conversation 1",
        createdAt: new Date(),
        updatedAt: 1000,
        conversationId: "conv-1",
      },
      {
        id: "chat-conv-2",
        title: "Server Conversation 2",
        createdAt: new Date(),
        updatedAt: 2000,
        conversationId: "conv-2",
      },
    ];

    act(() => {
      result.current.hydrateSessions(serverMetadata);
    });

    expect(result.current.sessions.length).toBeGreaterThanOrEqual(2);
    expect(result.current.sessions.some((s) => s.conversationId === "conv-1")).toBe(true);
    expect(result.current.sessions.some((s) => s.conversationId === "conv-2")).toBe(true);

    // Now populate messages for conv-1
    act(() => {
      result.current.replaceMessages(
        [
          { id: "m1", role: "user", content: "Hello" },
          { id: "m2", role: "assistant", content: "Hi there!" },
        ],
        result.current.sessions.find((s) => s.conversationId === "conv-1")?.id
      );
    });

    // Re-hydrate with metadata (which only has messages: [])
    act(() => {
      result.current.hydrateSessions(serverMetadata);
    });

    const session1 = result.current.sessions.find((s) => s.conversationId === "conv-1");
    expect(session1?.messages.length).toBe(2);
    expect(session1?.messages[0].content).toBe("Hello");
  });

  it("handles empty messages without crashing or breaking active session state", () => {
    const { result } = renderHook(() =>
      useChatSession<TestMessage, TestSession, TestMetadata>({
        createInitialSession: () => createMockSession("chat-empty", "conv-empty"),
      })
    );

    act(() => {
      result.current.replaceMessages([], "chat-empty");
    });

    expect(result.current.activeSession?.messages).toEqual([]);
    expect(result.current.activeSession?.id).toBe("chat-empty");
  });
});
