import * as React from "react";
import {
    DefaultButton,
    PrimaryButton,
    Modal,
    TextField,
    Dropdown,
    IDropdownOption,
    Spinner,
    SpinnerSize,
    Stack,
    Text,
} from "@fluentui/react";
import { API_BASE_URL } from "../config";
import { Logger } from "../socket/logger";

const baseUrl = `${API_BASE_URL}/`;

/** Zotero collection as returned by the backend. */
interface ZoteroCollection {
    key: string;
    name: string;
    parent_key?: string | null;
}

/** A PDF attachment under a Zotero item. */
interface ZoteroPdfAttachment {
    key: string;
    title?: string;
    filename?: string;
    content_type?: string;
    link_mode?: string;
}

/** A Zotero library item (normalized by the backend). */
interface ZoteroItem {
    key: string;
    title: string;
    date?: string;
    abstract_note?: string;
    publication_title?: string;
    authors?: string[];
    doi?: string;
    pdf_attachments?: ZoteroPdfAttachment[];
}

type ImportState = "idle" | "importing" | "imported" | "already" | "error";

export interface ZoteroStudioProps {
    /** Optional app user id (further namespaces server-side imports). */
    appUserId?: string;
}

const PAGE_SIZE = 20;

// sessionStorage keys: persistence survives panel close + page refresh, but is
// cleared automatically when the tab/browser is closed (exactly the desired scope).
const ZOTERO_SESSION_ID_KEY = "zotero_lr_session_id";
const ZOTERO_CONNECTION_KEY = "zotero_lr_connection";

interface PersistedConnection {
    connectionId: string;
    zoteroUserId: string;
    collections: ZoteroCollection[];
}

/** A stable, session-scoped id used as the backend chat_id for Zotero isolation.
 * Unlike the chat tab's session id (which is regenerated on every page load), this
 * persists across refresh so a restored connection still matches its backend scope. */
const getStableSessionId = (): string => {
    try {
        let id = sessionStorage.getItem(ZOTERO_SESSION_ID_KEY);
        if (!id) {
            const rand =
                typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
                    ? crypto.randomUUID()
                    : String(Date.now());
            id = `zotero_lr_${rand}`;
            sessionStorage.setItem(ZOTERO_SESSION_ID_KEY, id);
        }
        return id;
    } catch {
        return `zotero_lr_${Date.now()}`;
    }
};

const loadPersistedConnection = (): PersistedConnection | null => {
    try {
        const raw = sessionStorage.getItem(ZOTERO_CONNECTION_KEY);
        if (!raw) {
            return null;
        }
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.connectionId === "string" && parsed.connectionId) {
            return {
                connectionId: parsed.connectionId,
                zoteroUserId: parsed.zoteroUserId || "",
                collections: Array.isArray(parsed.collections) ? parsed.collections : [],
            };
        }
        return null;
    } catch {
        return null;
    }
};

const persistConnection = (data: PersistedConnection | null) => {
    try {
        if (data) {
            sessionStorage.setItem(ZOTERO_CONNECTION_KEY, JSON.stringify(data));
        } else {
            sessionStorage.removeItem(ZOTERO_CONNECTION_KEY);
        }
    } catch {
        /* ignore storage errors */
    }
};

const ZoteroIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}
        aria-hidden="true"
    >
        <rect width="100" height="100" rx="14" fill="#CC2936" />
        <text
            x="50"
            y="76"
            fontSize="68"
            fontWeight="900"
            fontFamily="'Arial Black', 'Helvetica Neue', Arial, sans-serif"
            fill="white"
            textAnchor="middle"
        >
            Z
        </text>
    </svg>
);

const ZoteroStudio: React.FC<ZoteroStudioProps> = ({ appUserId }) => {
    // Restore any connection saved earlier this browser session (survives refresh).
    const persisted = React.useMemo(() => loadPersistedConnection(), []);
    const chatId = React.useMemo(() => getStableSessionId(), []);

    // Connection
    const [connectionId, setConnectionId] = React.useState<string | null>(
        persisted?.connectionId ?? null
    );
    const [showModal, setShowModal] = React.useState(false);
    const [userId, setUserId] = React.useState(persisted?.zoteroUserId ?? "");
    const [apiKey, setApiKey] = React.useState("");
    const [connecting, setConnecting] = React.useState(false);
    const [connectError, setConnectError] = React.useState("");
    const [notice, setNotice] = React.useState("");

    // Library
    const [collections, setCollections] = React.useState<ZoteroCollection[]>(
        persisted?.collections ?? []
    );
    const [selectedCollection, setSelectedCollection] = React.useState<string | "all">("all");
    const [items, setItems] = React.useState<ZoteroItem[]>([]);
    const [loadingItems, setLoadingItems] = React.useState(false);
    const [itemsError, setItemsError] = React.useState("");
    const [start, setStart] = React.useState(0);
    const [hasMore, setHasMore] = React.useState(false);
    const [importState, setImportState] = React.useState<Record<string, ImportState>>({});

    const connected = !!connectionId;

    /** Build the JSON body shared by item/import requests (connection + isolation scope). */
    const scopeBody = React.useCallback(
        () => ({
            connection_id: connectionId,
            chat_id: chatId,
            user_id: appUserId || undefined,
        }),
        [connectionId, chatId, appUserId]
    );

    const connect = async () => {
        if (!userId.trim() || !apiKey.trim()) {
            setConnectError("Please enter both your Zotero User ID and API key.");
            return;
        }
        if (!chatId || chatId === "default") {
            setConnectError("Chat session is not ready yet. Please reopen the panel and try again.");
            return;
        }
        setConnecting(true);
        setConnectError("");
        try {
            const res = await fetch(`${baseUrl}zotero/connect`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: chatId,
                    zotero_user_id: userId.trim(),
                    zotero_api_key: apiKey.trim(),
                    user_id: appUserId || undefined,
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || data.status === "error") {
                setConnectError(data.message || `Zotero connection failed (${res.status}).`);
                return;
            }
            const nextCollections = Array.isArray(data.collections) ? data.collections : [];
            setConnectionId(data.connection_id);
            setCollections(nextCollections);
            setSelectedCollection("all");
            setShowModal(false);
            setApiKey("");
            setNotice("");
            persistConnection({
                connectionId: data.connection_id,
                zoteroUserId: userId.trim(),
                collections: nextCollections,
            });
            Logger.logUIInteraction?.({
                component: "ZoteroStudio",
                action: "zotero_connect_success",
            });
        } catch (err) {
            setConnectError("Could not reach the server. Check your network connection.");
        } finally {
            setConnecting(false);
        }
    };

    const disconnect = () => {
        setConnectionId(null);
        setCollections([]);
        setItems([]);
        setImportState({});
        setSelectedCollection("all");
        setStart(0);
        setHasMore(false);
        setApiKey("");
        setUserId("");
        setShowModal(false);
        setNotice("");
        persistConnection(null);
    };

    /** A restored connection can be gone server-side (TTL expiry or backend restart).
     * Reset to the disconnected state and prompt the user to reconnect. */
    const handleExpiredConnection = () => {
        setConnectionId(null);
        setItems([]);
        setImportState({});
        setStart(0);
        setHasMore(false);
        persistConnection(null);
        setNotice("Your Zotero session expired. Please reconnect.");
    };

    const loadItems = React.useCallback(
        async (collectionKey: string | "all", nextStart: number, append: boolean) => {
            if (!connectionId) {
                return;
            }
            setLoadingItems(true);
            setItemsError("");
            try {
                const res = await fetch(`${baseUrl}zotero/items`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        connection_id: connectionId,
                        chat_id: chatId,
                        user_id: appUserId || undefined,
                        collection_key: collectionKey === "all" ? undefined : collectionKey,
                        limit: PAGE_SIZE,
                        start: nextStart,
                    }),
                });
                const data = await res.json().catch(() => ({}));
                if (
                    data.code === "zotero_connection_not_found" ||
                    data.code === "zotero_scope_mismatch"
                ) {
                    handleExpiredConnection();
                    return;
                }
                if (!res.ok || data.status === "error") {
                    setItemsError(data.message || `Could not load library items (${res.status}).`);
                    return;
                }
                const fetched: ZoteroItem[] = Array.isArray(data.items) ? data.items : [];
                setItems((prev) => (append ? [...prev, ...fetched] : fetched));
                if (Array.isArray(data.collections) && data.collections.length) {
                    setCollections(data.collections);
                }
                setStart(nextStart);
                setHasMore(fetched.length === PAGE_SIZE);
            } catch (err) {
                setItemsError("Could not reach the server while loading items.");
            } finally {
                setLoadingItems(false);
            }
        },
        [connectionId, chatId, appUserId]
    );

    // Load items whenever a connection is established or the collection changes.
    React.useEffect(() => {
        if (connectionId) {
            void loadItems(selectedCollection, 0, false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [connectionId, selectedCollection]);

    const importPdf = async (item: ZoteroItem) => {
        const attachment = item.pdf_attachments?.[0];
        if (!attachment) {
            return;
        }
        setImportState((prev) => ({ ...prev, [item.key]: "importing" }));
        try {
            const res = await fetch(`${baseUrl}zotero/import-pdf`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...scopeBody(),
                    item_key: item.key,
                    attachment_key: attachment.key,
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || data.status === "error") {
                setImportState((prev) => ({ ...prev, [item.key]: "error" }));
                setItemsError(data.message || `Import failed (${res.status}).`);
                return;
            }
            setImportState((prev) => ({
                ...prev,
                [item.key]: data.status === "already_imported" ? "already" : "imported",
            }));
            Logger.logUIInteraction?.({
                component: "ZoteroStudio",
                action: "zotero_import_pdf",
                paperId: item.key,
                paperTitle: item.title,
            });
        } catch (err) {
            setImportState((prev) => ({ ...prev, [item.key]: "error" }));
        }
    };

    const collectionOptions: IDropdownOption[] = [
        { key: "all", text: "All items (top level)" },
        ...collections.map((c) => ({ key: c.key, text: c.name || "(Untitled collection)" })),
    ];

    const importLabel = (state: ImportState | undefined): string => {
        switch (state) {
            case "importing":
                return "Importing…";
            case "imported":
                return "Imported ✓";
            case "already":
                return "Already imported";
            case "error":
                return "Retry import";
            default:
                return "Import PDF";
        }
    };

    return (
        <div className="zotero-studio">
            <button
                type="button"
                className={`lit-review__zotero-btn${connected ? " is-connected" : ""}`}
                onClick={() => setShowModal(true)}
            >
                <ZoteroIcon size={18} />
                <span>{connected ? "Zotero Connected" : "Connect to Zotero"}</span>
            </button>

            {connected && (
                <div className="lit-review__zotero-status">
                    <span className="lit-review__zotero-status-dot" />
                    <span>Connected — import PDFs for full-text synthesis</span>
                </div>
            )}

            {!connected && notice && (
                <Text className="zotero-studio__error">{notice}</Text>
            )}

            {connected && (
                <div className="zotero-studio__library">
                    <div className="zotero-studio__toolbar">
                        <Dropdown
                            ariaLabel="Zotero collection"
                            options={collectionOptions}
                            selectedKey={selectedCollection}
                            onChange={(_, opt) =>
                                setSelectedCollection((opt?.key as string) || "all")
                            }
                            styles={{ root: { flex: 1, minWidth: 0 } }}
                        />
                        <DefaultButton
                            iconProps={{ iconName: "Refresh" }}
                            title="Refresh"
                            ariaLabel="Refresh items"
                            onClick={() => loadItems(selectedCollection, 0, false)}
                            disabled={loadingItems}
                            styles={{ root: { minWidth: 0, padding: "0 8px" } }}
                        />
                    </div>

                    {itemsError && (
                        <Text className="zotero-studio__error">{itemsError}</Text>
                    )}

                    {loadingItems && items.length === 0 ? (
                        <div className="zotero-studio__loading">
                            <Spinner size={SpinnerSize.medium} label="Loading library…" />
                        </div>
                    ) : items.length === 0 ? (
                        <Text className="zotero-studio__empty">
                            No items found in this collection.
                        </Text>
                    ) : (
                        <ul className="zotero-studio__items">
                            {items.map((item) => {
                                const hasPdf = (item.pdf_attachments?.length || 0) > 0;
                                const state = importState[item.key];
                                const done = state === "imported" || state === "already";
                                return (
                                    <li key={item.key} className="zotero-studio__item">
                                        <div className="zotero-studio__item-main">
                                            <span className="zotero-studio__item-title">
                                                {item.title || "(Untitled)"}
                                            </span>
                                            <span className="zotero-studio__item-meta">
                                                {[
                                                    (item.authors || []).slice(0, 2).join(", "),
                                                    item.date,
                                                    item.publication_title,
                                                ]
                                                    .filter(Boolean)
                                                    .join(" · ")}
                                            </span>
                                        </div>
                                        {hasPdf ? (
                                            <DefaultButton
                                                className="zotero-studio__import-btn"
                                                text={importLabel(state)}
                                                disabled={state === "importing" || done}
                                                onClick={() => importPdf(item)}
                                                styles={{ root: { minWidth: 0, padding: "0 8px" } }}
                                            />
                                        ) : (
                                            <span
                                                className="zotero-studio__no-pdf"
                                                title="No PDF attachment in Zotero cloud storage"
                                            >
                                                No PDF
                                            </span>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    {hasMore && !loadingItems && (
                        <DefaultButton
                            text="Load more"
                            onClick={() => loadItems(selectedCollection, start + PAGE_SIZE, true)}
                            styles={{ root: { width: "100%", marginTop: 8 } }}
                        />
                    )}
                </div>
            )}

            <Modal
                isOpen={showModal}
                onDismiss={() => {
                    setShowModal(false);
                    setConnectError("");
                }}
                isBlocking={false}
                styles={{ main: { maxWidth: 480, borderRadius: 12, padding: 32 } }}
            >
                <Text variant="xLarge" style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
                    Connect to Zotero
                </Text>
                <Text style={{ display: "block", marginBottom: 20, color: "#605e5c", fontSize: 13 }}>
                    Imports run on the server and are isolated to this session. Your API key is sent
                    only to this app's backend, never stored in the browser.
                </Text>
                <Stack tokens={{ childrenGap: 16 }}>
                    <TextField
                        label="Zotero User ID"
                        placeholder="e.g. 1234567"
                        value={userId}
                        onChange={(_, v) => setUserId(v ?? "")}
                        description="Find this at zotero.org/settings/keys (Your userID for use in API calls)"
                    />
                    <TextField
                        label="Zotero API Key"
                        placeholder="Enter your Zotero API key"
                        type="password"
                        canRevealPassword
                        value={apiKey}
                        onChange={(_, v) => setApiKey(v ?? "")}
                        description="Generate a read-enabled key at zotero.org/settings/keys"
                    />
                    {connectError && (
                        <Text style={{ color: "#a4262c", fontSize: 13 }}>{connectError}</Text>
                    )}
                </Stack>
                <Stack horizontal tokens={{ childrenGap: 8 }} style={{ marginTop: 24 }}>
                    <PrimaryButton
                        text={connecting ? "Connecting…" : connected ? "Reconnect" : "Connect"}
                        disabled={connecting}
                        onClick={connect}
                    />
                    {connected && <DefaultButton text="Disconnect" onClick={disconnect} />}
                    <DefaultButton
                        text="Cancel"
                        onClick={() => {
                            setShowModal(false);
                            setConnectError("");
                        }}
                    />
                </Stack>
            </Modal>
        </div>
    );
};

export default ZoteroStudio;
