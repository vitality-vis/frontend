import * as React from "react";
import { DefaultButton, IconButton, Modal, PrimaryButton } from "@fluentui/react";
import Markdown from "react-markdown";
import { Logger } from "../socket/logger";
import { API_BASE_URL } from "../config";
import { getPaperById } from "./Dialog";

const baseUrl = `${API_BASE_URL}/`;

/**
 * Endpoint that powers the Literature Review chat. It is SEPARATE from the
 * main interface chat and the existing chat tool-approval backend. It drives
 * the LR human-in-the-loop LangGraph workflow via a checkpoint protocol:
 *
 *   start:  POST {chat_id, message}                      -> lr_checkpoint
 *   resume: POST {chat_id, checkpoint_id, action, feedback} -> lr_checkpoint | lr_final
 *
 * A pending checkpoint is rendered as an interactive card (NOT a normal
 * assistant bubble); the graph only advances when the user clicks an action.
 */
const LR_CHAT_ENDPOINT = `${baseUrl}lrChat`;

/** Actions that require the user to type feedback before sending. */
const FEEDBACK_ACTIONS = new Set(["edit", "refine_search"]);

interface LrAction {
    id: string;
    label: string;
}

interface LrCheckpoint {
    checkpoint_id: string;
    checkpoint_type: string;
    title: string;
    content: string;
    actions: LrAction[];
    /** Set once the user has acted on this checkpoint (disables the card). */
    resolvedLabel?: string;
}

export interface LiteratureReviewChatMessage {
    role: "user" | "ai" | "checkpoint";
    text: string;
    /** Present only when role === "checkpoint". */
    checkpoint?: LrCheckpoint;
}

/**
 * Props mirror the subset of the main chat (`Dialog`) wiring that the
 * Literature Review panel needs. The conversation itself is independent.
 */
export interface LiteratureReviewChatProps {
    /** Persisted conversation for the dedicated 'litReview' chat state. */
    chatHistory?: LiteratureReviewChatMessage[];
    /** Persist conversation back into App state (dialogStates['litReview']). */
    updateDialogState: (updated: any) => void;
    /** Stable session id for this chat (used as chat_id for the LR thread). */
    chatSessionId?: string;
    /** Add resulting papers to the scatterplot selection. */
    addToSelectNodeIDs?: (ids: string[], target: string) => void;
    /** Add resulting papers to the "similar" input set. */
    addToSimilarInputPapers?: (paper: any) => void;
    /** Add resulting papers to the saved papers list. */
    addToSavedPapers?: (paper: any) => void;
    /** One-shot queue: a paper "Ask"ed from the saved-papers list. */
    queuedCorpusQuestionPaper?: { id: number; title: string; token: number } | null;
    onConsumeQueuedCorpusQuestionPaper?: () => void;
}

/**
 * Interactive checkpoint card. Shared *style* with the chat surface, but its
 * own LR-specific logic — it does not reuse the chat approval backend.
 */
const CheckpointCard: React.FC<{
    checkpoint: LrCheckpoint;
    disabled: boolean;
    onAct: (actionId: string, feedback: string) => void;
}> = ({ checkpoint, disabled, onAct }) => {
    const [pendingAction, setPendingAction] = React.useState<string | null>(null);
    const [feedback, setFeedback] = React.useState("");

    const handleClick = (actionId: string) => {
        if (FEEDBACK_ACTIONS.has(actionId)) {
            // Reveal a feedback box before sending.
            setPendingAction((cur) => (cur === actionId ? null : actionId));
            return;
        }
        onAct(actionId, "");
    };

    const submitFeedback = () => {
        if (!pendingAction) {
            return;
        }
        onAct(pendingAction, feedback.trim());
        setPendingAction(null);
        setFeedback("");
    };

    return (
        <div className={`lr-checkpoint ${disabled ? "is-resolved" : ""}`} role="group">
            <div className="lr-checkpoint__header">
                <span className="lr-checkpoint__badge">Checkpoint</span>
                <span className="lr-checkpoint__title">{checkpoint.title}</span>
            </div>
            <div className="lr-checkpoint__body">
                <Markdown>{checkpoint.content}</Markdown>
            </div>

            {disabled ? (
                <div className="lr-checkpoint__resolved">
                    ✓ {checkpoint.resolvedLabel || "Done"}
                </div>
            ) : (
                <>
                    <div className="lr-checkpoint__actions">
                        {checkpoint.actions.map((a) => (
                            <DefaultButton
                                key={a.id}
                                text={a.label}
                                className={
                                    a.id === "reject" ? "lr-checkpoint__btn--danger" : undefined
                                }
                                primary={a.id === "approve" || a.id === "accept"}
                                onClick={() => handleClick(a.id)}
                            />
                        ))}
                    </div>
                    {pendingAction && (
                        <div className="lr-checkpoint__feedback">
                            <textarea
                                className="chat-input"
                                value={feedback}
                                placeholder={
                                    pendingAction === "refine_search"
                                        ? "Describe how to refine the search…"
                                        : "Describe the edits you want…"
                                }
                                onChange={(e) => setFeedback(e.target.value)}
                                rows={2}
                                autoFocus
                            />
                            <div className="lr-checkpoint__feedback-actions">
                                <PrimaryButton
                                    text="Send"
                                    disabled={!feedback.trim()}
                                    onClick={submitFeedback}
                                />
                                <DefaultButton
                                    text="Cancel"
                                    onClick={() => {
                                        setPendingAction(null);
                                        setFeedback("");
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

const LiteratureReviewChat: React.FC<{ props: LiteratureReviewChatProps }> = ({ props }) => {
    const {
        chatHistory,
        updateDialogState,
        chatSessionId,
        addToSelectNodeIDs,
        addToSimilarInputPapers,
        addToSavedPapers,
        queuedCorpusQuestionPaper,
        onConsumeQueuedCorpusQuestionPaper,
    } = props;

    const [messages, setMessages] = React.useState<LiteratureReviewChatMessage[]>(
        chatHistory || []
    );
    const [input, setInput] = React.useState("");
    const [isWaiting, setIsWaiting] = React.useState(false);
    const [selectedQuestionPapers, setSelectedQuestionPapers] = React.useState<
        { id: number; title: string }[]
    >([]);

    // Id of the checkpoint currently awaiting an action (null when none).
    const [pendingCheckpointId, setPendingCheckpointId] = React.useState<string | null>(null);

    // Paper info modal (opened from a referenced-paper chip).
    const [isModalOpen, setModalOpen] = React.useState(false);
    const [paperInfo, setPaperInfo] = React.useState<any>(null);
    const [loadingPaperInfo, setLoadingPaperInfo] = React.useState(false);

    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const messagesEndRef = React.useRef<HTMLDivElement>(null);
    const consumedAskTokenRef = React.useRef<number | null>(null);
    const chatIdRef = React.useRef<string>(
        chatSessionId || `lr-${Math.random().toString(36).slice(2, 10)}`
    );
    const chatId = chatSessionId || chatIdRef.current;

    // Mirror of `messages` so async handlers always read the freshest list
    // without depending on a stale closure or nested setState.
    const messagesRef = React.useRef<LiteratureReviewChatMessage[]>(messages);

    // Keep local view in sync if the persisted history changes elsewhere.
    React.useEffect(() => {
        const next = chatHistory || [];
        messagesRef.current = next;
        setMessages(next);
    }, [chatHistory]);

    // Auto-scroll to the newest message.
    React.useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isWaiting]);

    // Consume a paper queued via the saved-papers list "Ask" button.
    React.useEffect(() => {
        const q = queuedCorpusQuestionPaper;
        if (!q) {
            return;
        }
        if (consumedAskTokenRef.current === q.token) {
            return;
        }
        consumedAskTokenRef.current = q.token;
        setSelectedQuestionPapers((prev) =>
            prev.some((p) => p.id === q.id) ? prev : [...prev, { id: q.id, title: q.title }]
        );
        textareaRef.current?.focus();
        onConsumeQueuedCorpusQuestionPaper?.();
    }, [queuedCorpusQuestionPaper, onConsumeQueuedCorpusQuestionPaper]);

    const persist = React.useCallback(
        (next: LiteratureReviewChatMessage[]) => {
            updateDialogState({ chatHistory: next });
        },
        [updateDialogState]
    );

    /** Single source of truth for updating messages: ref + state + persist. */
    const commitMessages = React.useCallback(
        (next: LiteratureReviewChatMessage[]) => {
            messagesRef.current = next;
            setMessages(next);
            persist(next);
        },
        [persist]
    );

    const openPaperInfoModal = async (id: number) => {
        setLoadingPaperInfo(true);
        setModalOpen(true);
        try {
            const paper = await getPaperById(String(id));
            setPaperInfo(paper || null);
        } catch (e) {
            console.error("Failed to load paper info:", e);
            setPaperInfo(null);
        }
        setLoadingPaperInfo(false);
    };

    /**
     * POST to /lrChat. Throws on a non-OK response so the real backend error
     * surfaces (we do not hide it behind a generic message).
     */
    const postLr = async (body: Record<string, any>): Promise<any> => {
        const response = await fetch(LR_CHAT_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, ...body }),
        });
        let data: any = null;
        try {
            data = await response.json();
        } catch (e) {
            throw new Error(`LR chat request failed (HTTP ${response.status})`);
        }
        if (!response.ok) {
            throw new Error((data && (data.error || data.content)) || `HTTP ${response.status}`);
        }
        return data;
    };

    /** Append an assistant text bubble onto the freshest message list. */
    const appendAi = (text: string) => {
        commitMessages([...messagesRef.current, { role: "ai", text }]);
    };

    /** Turn an LR backend response into chat entries (appends to freshest list). */
    const applyLrResponse = (data: any) => {
        const base = messagesRef.current;

        if (data && data.type === "lr_checkpoint") {
            const checkpoint: LrCheckpoint = {
                checkpoint_id: data.checkpoint_id,
                checkpoint_type: data.checkpoint_type,
                title: data.title,
                content: data.content,
                actions: data.actions || [],
            };
            commitMessages([
                ...base,
                { role: "checkpoint", text: data.title || "Checkpoint", checkpoint },
            ]);
            setPendingCheckpointId(checkpoint.checkpoint_id);
            return;
        }

        if (data && data.type === "lr_final") {
            appendAi(data.content || "(no draft produced)");
            setPendingCheckpointId(null);
            return;
        }

        // lr_message (reminders, cancellation, validation, errors).
        appendAi((data && data.content) || "");
    };

    /** Mark a checkpoint message as resolved so its card disables. */
    const markCheckpointResolved = (checkpointId: string, label: string) => {
        commitMessages(
            messagesRef.current.map((m) =>
                m.role === "checkpoint" && m.checkpoint?.checkpoint_id === checkpointId
                    ? { ...m, checkpoint: { ...m.checkpoint, resolvedLabel: label } }
                    : m
            )
        );
    };

    /** User pressed an action button on a checkpoint card. */
    const onCheckpointAction = async (
        checkpoint: LrCheckpoint,
        actionId: string,
        feedback: string
    ) => {
        if (isWaiting) {
            return;
        }
        const label =
            checkpoint.actions.find((a) => a.id === actionId)?.label || actionId;
        markCheckpointResolved(checkpoint.checkpoint_id, label);
        setPendingCheckpointId(null);
        setIsWaiting(true);

        Logger.logLLMInteraction?.({
            component: "LiteratureReviewChat",
            action: `checkpoint:${actionId}`,
            query: feedback,
            checkpointType: checkpoint.checkpoint_type,
        });

        try {
            const data = await postLr({
                checkpoint_id: checkpoint.checkpoint_id,
                action: actionId,
                feedback,
            });
            applyLrResponse(data);
        } catch (err: any) {
            console.error("LR checkpoint action failed:", err);
            appendAi(`Error: ${err?.message || err}`);
        } finally {
            setIsWaiting(false);
        }
    };

    /** User sent free text (starts a new LR run, or pings a pending checkpoint). */
    const sendChat = async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed || isWaiting) {
            return;
        }
        const attachedTitles = selectedQuestionPapers.map((p) => p.title);
        const goal = attachedTitles.length
            ? `${trimmed}\n\nFocus papers: ${attachedTitles.join("; ")}`
            : trimmed;

        const userMsg: LiteratureReviewChatMessage = { role: "user", text: trimmed };
        commitMessages([...messagesRef.current, userMsg]);
        setInput("");
        setSelectedQuestionPapers([]);
        setIsWaiting(true);

        Logger.logLLMInteraction?.({
            component: "LiteratureReviewChat",
            action: "message",
            query: trimmed,
            paperCount: attachedTitles.length,
        });

        try {
            const data = await postLr({ message: goal });
            applyLrResponse(data);
        } catch (err: any) {
            console.error("Literature Review chat failed:", err);
            appendAi(`Error: ${err?.message || err}`);
        } finally {
            setIsWaiting(false);
        }
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendChat(input);
        }
    };

    const toggleQuestionPaper = (paper: { id: number; title: string }) => {
        setSelectedQuestionPapers((prev) => prev.filter((p) => p.id !== paper.id));
    };

    const hasContent = messages.length > 0 || isWaiting;

    return (
        <div
            className="app-container"
            style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                minHeight: 0,
                width: "100%",
                overflow: "hidden",
            }}
        >
            {/* Scrollable conversation */}
            <div className="chat-content-row">
                {!hasContent ? (
                    <div className="chat-empty-state" role="status" aria-live="polite">
                        <p>
                            Describe your literature-review goal to begin. I'll propose a plan,
                            retrieve papers, and draft a review — pausing at each checkpoint for
                            your approval.
                        </p>
                    </div>
                ) : (
                    <div className="chat-messages">
                        {messages.map((msg, idx) => {
                            if (msg.role === "checkpoint" && msg.checkpoint) {
                                const cp = msg.checkpoint;
                                const resolved =
                                    !!cp.resolvedLabel || pendingCheckpointId !== cp.checkpoint_id;
                                return (
                                    <CheckpointCard
                                        key={idx}
                                        checkpoint={cp}
                                        disabled={resolved}
                                        onAct={(actionId, feedback) =>
                                            onCheckpointAction(cp, actionId, feedback)
                                        }
                                    />
                                );
                            }
                            return (
                                <div key={idx} className={`chat-bubble ${msg.role}`}>
                                    {msg.role === "user" ? (
                                        <div>{msg.text}</div>
                                    ) : (
                                        <Markdown>{msg.text}</Markdown>
                                    )}
                                </div>
                            );
                        })}
                        {isWaiting && (
                            <div className="chat-bubble ai" aria-live="polite">
                                <span className="lit-review-chat__typing">
                                    <span />
                                    <span />
                                    <span />
                                </span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input + actions */}
            <div className="chat-input-area">
                {pendingCheckpointId && (
                    <div className="lr-checkpoint__hint" role="status">
                        A checkpoint is waiting for your decision above.
                    </div>
                )}
                {selectedQuestionPapers.length > 0 && (
                    <div style={{ marginBottom: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {selectedQuestionPapers.map((p) => (
                            <div
                                key={p.id}
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    padding: "4px 8px",
                                    borderRadius: 12,
                                    background: "var(--color-primary-light)",
                                    color: "var(--color-primary)",
                                    fontSize: "0.8rem",
                                    maxWidth: "100%",
                                }}
                            >
                                <span
                                    style={{
                                        cursor: "pointer",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                        maxWidth: 220,
                                    }}
                                    onClick={() => openPaperInfoModal(p.id)}
                                >
                                    {p.title}
                                </span>
                                <IconButton
                                    styles={{ root: { marginLeft: 4, width: 20, height: 20 } }}
                                    iconProps={{ iconName: "Cancel" }}
                                    onClick={() => toggleQuestionPaper(p)}
                                />
                            </div>
                        ))}
                    </div>
                )}

                <div className="chat-input-row">
                    <textarea
                        ref={textareaRef}
                        className="chat-input"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={onKeyDown}
                        placeholder="Type your message"
                        rows={1}
                    />
                    <DefaultButton
                        className="iconButton"
                        styles={{ root: { padding: "0 1rem", minWidth: 0 } }}
                        onClick={() => sendChat(input)}
                        iconProps={{ iconName: "Rocket" }}
                        text="Ask"
                        disabled={isWaiting}
                    />
                </div>

                <div
                    className="chat-action-row"
                    style={{ display: "flex", flexWrap: "nowrap", alignItems: "center", gap: "4px" }}
                >
                    <DefaultButton
                        text="ALL"
                        iconProps={{ iconName: "Locate" }}
                        styles={{ root: { minWidth: 0, padding: "0 6px" } }}
                        onClick={() => {
                            const ids = selectedQuestionPapers.map((p) => String(p.id));
                            if (ids.length) {
                                addToSelectNodeIDs?.(ids, "scatterplot");
                            }
                        }}
                    />
                    <DefaultButton
                        text="ALL"
                        iconProps={{ iconName: "PlusCircle" }}
                        styles={{ root: { minWidth: 0, padding: "0 6px" } }}
                        onClick={async () => {
                            for (const p of selectedQuestionPapers) {
                                try {
                                    const paper = await getPaperById(String(p.id));
                                    if (paper) {
                                        addToSimilarInputPapers?.(paper);
                                    }
                                } catch (e) {
                                    console.error("Failed to add paper:", e);
                                }
                            }
                        }}
                    />
                    <DefaultButton
                        text="ALL"
                        iconProps={{ iconName: "Save" }}
                        styles={{ root: { minWidth: 0, padding: "0 6px" } }}
                        onClick={async () => {
                            for (const p of selectedQuestionPapers) {
                                try {
                                    const paper = await getPaperById(String(p.id));
                                    if (paper) {
                                        addToSavedPapers?.(paper);
                                    }
                                } catch (e) {
                                    console.error("Failed to save paper:", e);
                                }
                            }
                        }}
                    />
                </div>
            </div>

            {/* Paper info modal */}
            <Modal
                isOpen={isModalOpen}
                onDismiss={() => setModalOpen(false)}
                isBlocking={false}
                containerClassName="paper-info-modal"
            >
                <div style={{ padding: 24, maxWidth: 560 }}>
                    {loadingPaperInfo ? (
                        <p>Loading…</p>
                    ) : paperInfo ? (
                        <>
                            <h2 style={{ marginTop: 0 }}>{paperInfo.Title || "Untitled"}</h2>
                            <p style={{ color: "#666" }}>
                                {paperInfo.Year ? `${paperInfo.Year} · ` : ""}
                                {paperInfo.Source || ""}
                            </p>
                            <p>{paperInfo.Abstract || "No abstract available."}</p>
                        </>
                    ) : (
                        <p>No paper information available.</p>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default LiteratureReviewChat;
