import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AIChatPanel from "../AIChatPanel";
import * as practiceApi from "../../api/practiceApi";

vi.mock("../../api/practiceApi", () => ({
  getAllChats: vi.fn(),
  getChatContents: vi.fn(),
  deleteChatSession: vi.fn(),
  renameChatSession: vi.fn(),
  createChatSession: vi.fn(),
  getAIExplanation: vi.fn(),
}));

describe("AIChatPanel Integration (Tier 2 Feature Test)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it("does not enter an infinite loop when selecting a chat history with empty chat content", async () => {
    const user = userEvent.setup();

    // 1. Mock server returning one chat session
    vi.mocked(practiceApi.getAllChats).mockResolvedValue([
      {
        id: "empty-conv-123",
        title: "Empty Test Conversation",
        createdAt: new Date("2026-01-01T00:00:00Z"),
      },
    ]);

    // 2. Mock content endpoint returning empty array []
    const getContentsMock = vi.mocked(practiceApi.getChatContents).mockResolvedValue([]);

    render(
      <AIChatPanel
        question={null}
        isFullscreen={false}
        isMobileView={false}
        onClose={vi.fn()}
        onToggleFullscreen={vi.fn()}
        showReferences={false}
      />
    );

    // 3. Open the history sidebar
    const historyToggle = await screen.findByRole("button", { name: /show your chats/i });
    await user.click(historyToggle);

    // 4. Click the empty chat from the sidebar
    const conversationItem = await screen.findByRole("button", { name: /Empty Test Conversation/ });
    await user.click(conversationItem);

    // 5. Verify the API is called
    await waitFor(() => {
      expect(getContentsMock).toHaveBeenCalledWith("empty-conv-123");
    });

    // 6. Give microtasks and state updates a short tick to ensure it didn't trigger runaway loops
    await new Promise((resolve) => setTimeout(resolve, 80));

    // The core fix: getChatContents must ONLY be called once, NOT looping endlessly!
    expect(getContentsMock).toHaveBeenCalledTimes(1);

    // 7. Verify the UI is fully responsive and not frozen
    const input = screen.getByPlaceholderText(/how can i help you today\?/i);
    expect(input).toBeEnabled();
    await user.type(input, "Testing responsive input");
    expect(input).toHaveValue("Testing responsive input");
  });

  it("correctly loads and displays messages for a non-empty chat history", async () => {
    const user = userEvent.setup();

    vi.mocked(practiceApi.getAllChats).mockResolvedValue([
      {
        id: "active-conv-456",
        title: "Populated Conversation",
        createdAt: new Date("2026-01-01T00:00:00Z"),
      },
    ]);

    vi.mocked(practiceApi.getChatContents).mockResolvedValue([
      {
        id: "msg-1",
        role: "user",
        content: "What is photosynthesis?",
        timestamp: new Date(),
      },
      {
        id: "msg-2",
        role: "assistant",
        content: "Photosynthesis is the process by which green plants convert light into energy.",
        timestamp: new Date(),
      },
    ]);

    render(
      <AIChatPanel
        question={null}
        isFullscreen={false}
        isMobileView={false}
        onClose={vi.fn()}
        onToggleFullscreen={vi.fn()}
        showReferences={false}
      />
    );

    const historyToggle = await screen.findByRole("button", { name: /show your chats/i });
    await user.click(historyToggle);

    const conversationItem = await screen.findByRole("button", { name: /Populated Conversation/ });
    await user.click(conversationItem);

    await waitFor(() => {
      expect(screen.getByText("What is photosynthesis?")).toBeInTheDocument();
      expect(screen.getByText(/process by which green plants convert light/i)).toBeInTheDocument();
    });
  });
});
