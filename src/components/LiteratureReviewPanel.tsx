import * as React from "react";
import {
    Panel,
    PanelType,
    Callout,
    DirectionalHint,
    PrimaryButton,
    TextField,
    Label,
    Stack,
    Text,
} from "@fluentui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter, faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { CorpusResultsList, PaperRow, CorpusSavedActions } from "./CorpusResultsList";
import LiteratureReviewChat from "./LiteratureReviewChat";
import ZoteroStudio from "./ZoteroStudio";
import {
    CorpusResultsFilterState,
    emptyCorpusResultsFilter,
    hasActiveCorpusResultsFilters,
    filterCorpusResultsByFacets,
} from "./corpusFilter";
import "./../assets/scss/CorpusResultsList.scss";

// Column widths are flex-grow ratios that always sum to 100, so the columns plus
// fixed-width gutters always exactly fill the container (no horizontal scroll).
const LR_INITIAL_PCT = [30, 40, 30];
// Minimum column widths in pixels (converted to ratios at drag time).
const LR_MIN_PX = [240, 320, 260];
const GUTTER_PX = 8;

export interface LiteratureReviewPanelProps {
    isOpen: boolean;
    onDismiss: () => void;
    checkoutLinkRef: any;
    /** Saved papers shown in the first column (results-style list). */
    savedPapers: PaperRow[];
    /** Row-level actions for the saved papers list (Summarize / Delete). */
    savedActions: CorpusSavedActions;
    /** True when a recently deleted saved paper can be restored. */
    canUndoDelete: boolean;
    /** Number of deletions currently on the undo stack (shown as a badge). */
    undoCount: number;
    /** Restore the most recently deleted saved paper (one step per click). */
    onUndoDelete: () => void;
    /** Open the summary detail card (same modal as the main interface), with prev/next nav. */
    onShowPaperDetail: (paper: PaperRow, navList: PaperRow[]) => void;
    /** Open the inline "explore" reading view in column 1 (title click), with prev/next nav. */
    onExplorePaper: (paper: PaperRow, navList: PaperRow[]) => void;
    /** Whether the inline explore reading view is currently shown in column 1. */
    isExploring: boolean;
    /** Pre-rendered inline explore reading view (provided by App when isExploring). */
    exploreView: React.ReactNode;
    /** Props passed straight to the dedicated chat <Dialog> (middle column). */
    chatProps: any;
}

const LiteratureReviewPanel: React.FC<LiteratureReviewPanelProps> = ({
    isOpen,
    onDismiss,
    checkoutLinkRef,
    savedPapers,
    savedActions,
    canUndoDelete,
    undoCount,
    onUndoDelete,
    onShowPaperDetail,
    onExplorePaper,
    isExploring,
    exploreView,
    chatProps,
}) => {
    const [filter, setFilter] = React.useState<CorpusResultsFilterState>(emptyCorpusResultsFilter());
    const [draft, setDraft] = React.useState<CorpusResultsFilterState>(emptyCorpusResultsFilter());
    const [filterOpen, setFilterOpen] = React.useState(false);
    const [colPct, setColPct] = React.useState<number[]>(LR_INITIAL_PCT);

    // App user id (optional) — further namespaces server-side Zotero imports.
    const appUserId = React.useMemo(() => {
        try {
            return localStorage.getItem("userId") || undefined;
        } catch {
            return undefined;
        }
    }, []);

    const filterBtnRef = React.useRef<HTMLButtonElement>(null);
    const sourcesColRef = React.useRef<HTMLDivElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const dragRef = React.useRef<{
        idx: number;
        startX: number;
        startPct: number[];
        contentWidth: number;
    } | null>(null);

    // Pointer Events + pointer capture: works reliably inside the Fluent Panel/overlay,
    // updates in real time, and cannot leave the cursor stuck on release.
    const onGutterPointerDown = (idx: number) => (e: React.PointerEvent<HTMLDivElement>) => {
        const el = containerRef.current;
        if (!el) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        const totalGutters = (LR_INITIAL_PCT.length - 1) * GUTTER_PX;
        const contentWidth = Math.max(1, el.getBoundingClientRect().width - totalGutters);
        dragRef.current = { idx, startX: e.clientX, startPct: [...colPct], contentWidth };
        try {
            e.currentTarget.setPointerCapture(e.pointerId);
        } catch (_err) {
            /* no-op */
        }
        document.body.style.cursor = "col-resize";
    };

    const onGutterPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        const d = dragRef.current;
        if (!d) {
            return;
        }
        const deltaPct = ((e.clientX - d.startX) / d.contentWidth) * 100;
        const minPct = LR_MIN_PX.map((px) => (px / d.contentWidth) * 100);
        let left = d.startPct[d.idx] + deltaPct;
        let right = d.startPct[d.idx + 1] - deltaPct;
        const minL = minPct[d.idx];
        const minR = minPct[d.idx + 1];
        if (left < minL) {
            right -= minL - left;
            left = minL;
        }
        if (right < minR) {
            left -= minR - right;
            right = minR;
        }
        const next = [...d.startPct];
        next[d.idx] = left;
        next[d.idx + 1] = right;
        setColPct(next);
    };

    const onGutterPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!dragRef.current) {
            return;
        }
        dragRef.current = null;
        document.body.style.cursor = "";
        try {
            e.currentTarget.releasePointerCapture(e.pointerId);
        } catch (_err) {
            /* no-op */
        }
    };

    React.useEffect(() => {
        return () => {
            document.body.style.cursor = "";
        };
    }, []);

    const filtersOn = hasActiveCorpusResultsFilters(filter);
    const filteredPapers = React.useMemo(
        () => filterCorpusResultsByFacets(savedPapers || [], filter),
        [savedPapers, filter]
    );

    const toggleFilter = () => {
        setFilterOpen((open) => {
            const next = !open;
            if (next) {
                setDraft({ ...filter });
            }
            return next;
        });
    };

    const applyFilters = () => {
        setFilter({ ...draft });
        setFilterOpen(false);
    };

    const clearFilters = () => {
        setFilter(emptyCorpusResultsFilter());
        setDraft(emptyCorpusResultsFilter());
        setFilterOpen(false);
    };

    return (
        <Panel
            headerText="Literature Review"
            isOpen={isOpen}
            onDismiss={onDismiss}
            type={PanelType.smallFluid}
            closeButtonAriaLabel="Close"
            styles={{
                scrollableContent: {
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: 1,
                    overflow: "hidden",
                    minHeight: 0,
                },
                content: {
                    padding: 0,
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: 1,
                    minHeight: 0,
                },
            }}
        >
            <a ref={checkoutLinkRef}></a>
            <div className="lit-review" ref={containerRef}>
                {/* Column 1 — Saved papers (results-style list + filter) */}
                <section
                    className="lit-review__col lit-review__sources"
                    ref={sourcesColRef}
                    style={{ flexGrow: colPct[0], flexShrink: 1, flexBasis: 0 }}
                >
                    {isExploring ? (
                        <div className="lit-review__col-body lit-review__explore-body">
                            {exploreView}
                        </div>
                    ) : (
                    <>
                    <header className="lit-review__col-header">
                        <div className="lit-review__col-titles">
                            <Text variant="large">Saved Papers</Text>
                            <span className="lit-review__count">
                                {filtersOn
                                    ? `${filteredPapers.length} of ${savedPapers.length} papers`
                                    : `${savedPapers.length} papers`}
                            </span>
                        </div>
                        <div className="lit-review__col-header-actions">
                            <button
                                type="button"
                                className="lit-review__undo-btn"
                                title={
                                    canUndoDelete
                                        ? `Undo delete — ${undoCount} step${undoCount === 1 ? "" : "s"} to restore`
                                        : "Nothing to undo"
                                }
                                aria-label="Undo delete"
                                disabled={!canUndoDelete}
                                onClick={onUndoDelete}
                            >
                                <FontAwesomeIcon icon={faRotateLeft} aria-hidden />
                                <span className="lit-review__undo-btn-label">Undo</span>
                                {undoCount > 0 ? (
                                    <span className="lit-review__undo-btn-badge">{undoCount}</span>
                                ) : null}
                            </button>
                            <button
                                ref={filterBtnRef}
                                type="button"
                                className={`app-master-header__filter-btn${filtersOn ? " is-active" : ""}${
                                    filterOpen ? " is-open" : ""
                                }`}
                                title="Filter saved papers"
                                aria-label="Filter saved papers"
                                aria-expanded={filterOpen}
                                aria-haspopup="dialog"
                                onClick={toggleFilter}
                            >
                                <FontAwesomeIcon
                                    icon={faFilter}
                                    className="app-master-header__filter-btn-icon"
                                    aria-hidden
                                />
                                <span className="app-master-header__filter-btn-text">
                                    <span className="app-master-header__filter-btn-label">Filter</span>
                                    <span className="app-master-header__filter-btn-hint">
                                        Year, citations, source…
                                    </span>
                                </span>
                            </button>
                        </div>
                    </header>
                    <div className="lit-review__col-body">
                        <CorpusResultsList
                            papers={filteredPapers}
                            selectedPaperId={null}
                            onTitleClick={(paper) => onExplorePaper(paper, filteredPapers)}
                            onPaperInfoClick={(paper) => onShowPaperDetail(paper, filteredPapers)}
                            savedActions={savedActions}
                            paginationResetKey={`${savedPapers.length}|${JSON.stringify(filter)}`}
                        />
                    </div>
                    {filterOpen ? (
                        <Callout
                            className="app-results-filter-callout"
                            target={filterBtnRef}
                            directionalHint={DirectionalHint.bottomCenter}
                            directionalHintFixed
                            onDismiss={() => setFilterOpen(false)}
                            setInitialFocus
                            isBeakVisible
                            gapSpace={8}
                            beakWidth={12}
                            preventDismissOnLostFocus={false}
                            layerProps={{ styles: { root: { zIndex: 1000002 } } }}
                            styles={{
                                calloutMain: {
                                    borderRadius: 12,
                                    boxShadow: "0 8px 28px rgba(0, 0, 0, 0.14)",
                                    border: "1px solid #e1e5eb",
                                    maxWidth: 340,
                                    minWidth: 240,
                                    boxSizing: "border-box",
                                },
                            }}
                        >
                            <div
                                className="app-results-filter-popover"
                                role="dialog"
                                aria-label="Filter saved papers"
                            >
                                <div className="app-results-filter-popover__header">
                                    <Text variant="mediumPlus" className="app-results-filter-popover__title">
                                        Filter saved papers
                                    </Text>
                                    <button
                                        type="button"
                                        className="app-results-filter-popover__clear-link"
                                        onClick={clearFilters}
                                    >
                                        Clear all
                                    </button>
                                </div>
                                <Stack tokens={{ childrenGap: 16 }}>
                                    <div className="app-results-filter-popover__field">
                                        <Label>Published between (year)</Label>
                                        <Stack horizontal verticalAlign="end" tokens={{ childrenGap: 8 }} wrap>
                                            <TextField
                                                ariaLabel="Minimum year"
                                                placeholder="YYYY"
                                                value={draft.yearMin}
                                                onChange={(_, v) =>
                                                    setDraft((prev) => ({ ...prev, yearMin: v ?? "" }))
                                                }
                                                styles={{ root: { flex: 1, minWidth: 88 } }}
                                            />
                                            <span className="app-results-filter-popover__dash" aria-hidden>
                                                –
                                            </span>
                                            <TextField
                                                ariaLabel="Maximum year"
                                                placeholder="YYYY"
                                                value={draft.yearMax}
                                                onChange={(_, v) =>
                                                    setDraft((prev) => ({ ...prev, yearMax: v ?? "" }))
                                                }
                                                styles={{ root: { flex: 1, minWidth: 88 } }}
                                            />
                                        </Stack>
                                    </div>
                                    <div className="app-results-filter-popover__field">
                                        <Label>Citation count</Label>
                                        <Stack horizontal verticalAlign="end" tokens={{ childrenGap: 8 }} wrap>
                                            <TextField
                                                ariaLabel="Minimum citations"
                                                placeholder="Min"
                                                value={draft.citationsMin}
                                                onChange={(_, v) =>
                                                    setDraft((prev) => ({ ...prev, citationsMin: v ?? "" }))
                                                }
                                                styles={{ root: { flex: 1, minWidth: 88 } }}
                                            />
                                            <span className="app-results-filter-popover__dash" aria-hidden>
                                                –
                                            </span>
                                            <TextField
                                                ariaLabel="Maximum citations"
                                                placeholder="Max"
                                                value={draft.citationsMax}
                                                onChange={(_, v) =>
                                                    setDraft((prev) => ({ ...prev, citationsMax: v ?? "" }))
                                                }
                                                styles={{ root: { flex: 1, minWidth: 88 } }}
                                            />
                                        </Stack>
                                    </div>
                                    <div className="app-results-filter-popover__field">
                                        <Label>Source (venue)</Label>
                                        <TextField
                                            ariaLabel="Venue or source contains"
                                            placeholder="e.g. KDD, NeurIPS…"
                                            value={draft.venue}
                                            onChange={(_, v) =>
                                                setDraft((prev) => ({ ...prev, venue: v ?? "" }))
                                            }
                                        />
                                    </div>
                                </Stack>
                                <PrimaryButton
                                    className="app-results-filter-popover__apply"
                                    text="Apply"
                                    onClick={applyFilters}
                                    styles={{ root: { width: "100%", marginTop: 20 } }}
                                />
                            </div>
                        </Callout>
                    ) : null}
                    </>
                    )}
                </section>

                <div
                    className="lit-review__gutter"
                    role="separator"
                    aria-orientation="vertical"
                    aria-label="Resize saved papers / chat columns"
                    onPointerDown={onGutterPointerDown(0)}
                    onPointerMove={onGutterPointerMove}
                    onPointerUp={onGutterPointerUp}
                    onPointerCancel={onGutterPointerUp}
                />

                {/* Column 2 — Chat */}
                <section
                    className="lit-review__col lit-review__chat"
                    style={{ flexGrow: colPct[1], flexShrink: 1, flexBasis: 0 }}
                >
                    <header className="lit-review__col-header">
                        <div className="lit-review__col-titles">
                            <Text variant="large">Chat</Text>
                            <span className="lit-review__count">Ask about your saved papers</span>
                        </div>
                    </header>
                    <div className="lit-review__col-body lit-review__chat-body">
                        <LiteratureReviewChat props={chatProps} />
                    </div>
                </section>

                <div
                    className="lit-review__gutter"
                    role="separator"
                    aria-orientation="vertical"
                    aria-label="Resize chat / studio columns"
                    onPointerDown={onGutterPointerDown(1)}
                    onPointerMove={onGutterPointerMove}
                    onPointerUp={onGutterPointerUp}
                    onPointerCancel={onGutterPointerUp}
                />

                {/* Column 3 — Studio */}
                <section
                    className="lit-review__col lit-review__studio"
                    style={{ flexGrow: colPct[2], flexShrink: 1, flexBasis: 0 }}
                >
                    <header className="lit-review__col-header">
                        <div className="lit-review__col-titles">
                            <Text variant="large">Studio</Text>
                            <span className="lit-review__count">Summaries & notes</span>
                        </div>
                    </header>
                    <div className="lit-review__col-body lit-review__studio-body">
                        <ZoteroStudio appUserId={appUserId} />
                    </div>
                </section>
            </div>
        </Panel>
    );
};

export default LiteratureReviewPanel;
