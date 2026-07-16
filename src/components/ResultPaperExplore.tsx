import * as React from "react";
import { DefaultButton, IconButton } from "@fluentui/react";
import { PaperRow } from "./CorpusResultsList";

type HighlightOp = { field: string; start: number; end: number; text: string };

export interface ResultPaperExploreProps {
    rp: any | null;
    loading: boolean;
    atStart: boolean;
    atEnd: boolean;
    onClose: () => void;
    onPrev: () => void;
    onNext: () => void;
    contentRef: React.RefObject<HTMLDivElement>;
    getHighlightOps: (id: number) => HighlightOp[];
    getHighlightOpsForField: (id: number, field: string) => HighlightOp[];
    renderHighlightedText: (text: string, ops: HighlightOp[]) => React.ReactNode;
    onHighlight: () => void;
    onUndo: () => void;
    onClear: () => void;
    onAsk: (paper: PaperRow) => void;
    onSummarize: (paper: PaperRow) => void;
    onDelete: (paper: PaperRow) => void;
    onGScholar: (title: string) => void;
}

/**
 * The Litmaps-style inline "explore" reading view for a single paper. Mirrors the
 * main interface's results-sidebar explore view; reused inside the Literature Review
 * panel. All paper/nav/highlight state lives in App and is passed in via props so the
 * highlight selection logic (which reads `contentRef`) keeps working.
 */
const ResultPaperExplore: React.FC<ResultPaperExploreProps> = ({
    rp,
    loading,
    atStart,
    atEnd,
    onClose,
    onPrev,
    onNext,
    contentRef,
    getHighlightOps,
    getHighlightOpsForField,
    renderHighlightedText,
    onHighlight,
    onUndo,
    onClear,
    onAsk,
    onSummarize,
    onDelete,
    onGScholar,
}) => {
    const refCount = rp?.ReferenceCounts ?? rp?.References ?? rp?.NumReferences;
    const hasRef =
        refCount != null && refCount !== "" && !Number.isNaN(Number(refCount));

    return (
        <div className="app-master-explore" role="article">
            <div className="result-paper-modal__nav result-paper-modal__nav--inline">
                <IconButton
                    iconProps={{ iconName: "Cancel" }}
                    ariaLabel="Back to list"
                    title="Back to list"
                    onClick={onClose}
                    className="result-paper-modal__nav-close"
                />
                <DefaultButton
                    text="Previous"
                    disabled={atStart || loading}
                    iconProps={{ iconName: "ChevronLeft" }}
                    onClick={onPrev}
                    className="result-paper-modal__nav-prev"
                />
                <span className="result-paper-modal__nav-spacer" />
                <DefaultButton
                    text="Next"
                    disabled={atEnd || loading}
                    iconProps={{ iconName: "ChevronRight" }}
                    onClick={onNext}
                    className="result-paper-modal__nav-next"
                />
            </div>
            <div className="result-paper-modal__body result-paper-modal__body--inline">
                {loading ? (
                    <div className="result-paper-modal__loading">Loading details...</div>
                ) : rp ? (
                    (() => {
                        const paperAsRow: PaperRow = {
                            ID: rp.ID,
                            Title: rp.Title,
                            Authors: rp.Authors,
                            Year: rp.Year,
                            CitationCounts: rp.CitationCounts,
                            Source: rp.Source || rp.Venue,
                        };
                        const highlightOps = getHighlightOps(rp.ID);
                        const titleText = rp.Title || "(No title)";
                        const yearText = rp.Year != null ? String(rp.Year) : "N/A";
                        const abstractText = rp.Abstract || "N/A";
                        const keywordsText = Array.isArray(rp.Keywords)
                            ? rp.Keywords.join(", ")
                            : rp.Keywords || "N/A";
                        const titleHighlightOps = getHighlightOpsForField(rp.ID, "title");
                        const yearHighlightOps = getHighlightOpsForField(rp.ID, "year");
                        const abstractHighlightOps = getHighlightOpsForField(rp.ID, "abstract");
                        const keywordsHighlightOps = getHighlightOpsForField(rp.ID, "keywords");
                        const hasHighlights = highlightOps.length > 0;
                        return (
                            <div ref={contentRef} className="result-paper-explore">
                                <div className="result-paper-explore__highlight-tools result-paper-explore__highlight-tools--sticky">
                                    <DefaultButton
                                        text="Highlight"
                                        iconProps={{ iconName: "Edit" }}
                                        onClick={onHighlight}
                                    />
                                    <DefaultButton
                                        text="Undo"
                                        iconProps={{ iconName: "Undo" }}
                                        disabled={!hasHighlights}
                                        onClick={onUndo}
                                    />
                                    <DefaultButton
                                        text="Clear"
                                        iconProps={{ iconName: "Clear" }}
                                        disabled={!hasHighlights}
                                        onClick={onClear}
                                    />
                                </div>
                                <h2 className="result-paper-explore__headline">
                                    <span data-highlight-field="title">
                                        {renderHighlightedText(titleText, titleHighlightOps)}
                                    </span>
                                </h2>
                                <div className="result-paper-explore__detail-meta">
                                    <p>
                                        <b>Authors</b>:{" "}
                                        {Array.isArray(rp.Authors)
                                            ? rp.Authors.join(", ")
                                            : rp.Authors || "N/A"}
                                    </p>
                                    <p>
                                        <b>Source</b>: {rp.Source || rp.Venue || "N/A"}
                                    </p>
                                    <p>
                                        <b>Year</b>:{" "}
                                        <span data-highlight-field="year">
                                            {renderHighlightedText(yearText, yearHighlightOps)}
                                        </span>
                                    </p>
                                    <p>
                                        <b>No. of Citations</b>: {rp.CitationCounts ?? "N/A"}
                                    </p>
                                    {hasRef ? (
                                        <p>
                                            <b>References</b>: {String(refCount)}
                                        </p>
                                    ) : null}
                                </div>
                                <div className="result-paper-explore__abstract-block">
                                    <b>Abstract</b>:{" "}
                                    <div
                                        data-highlight-field="abstract"
                                        className="result-paper-explore__abstract-content"
                                    >
                                        {renderHighlightedText(abstractText, abstractHighlightOps)}
                                    </div>
                                </div>
                                <div className="result-paper-explore__keywords-block">
                                    <b>Keywords</b>:{" "}
                                    <span data-highlight-field="keywords">
                                        {renderHighlightedText(keywordsText, keywordsHighlightOps)}
                                    </span>
                                </div>
                                <div className="result-paper-explore__actions">
                                    <DefaultButton
                                        text="Ask"
                                        iconProps={{ iconName: "Chat" }}
                                        onClick={() => onAsk(paperAsRow)}
                                    />
                                    <DefaultButton
                                        text="Summarize"
                                        iconProps={{ iconName: "TextDocument" }}
                                        onClick={() => onSummarize(paperAsRow)}
                                    />
                                    <DefaultButton
                                        text="Delete"
                                        iconProps={{ iconName: "Delete" }}
                                        onClick={() => onDelete(paperAsRow)}
                                    />
                                    <DefaultButton
                                        text="Google Scholar"
                                        iconProps={{ iconName: "Link" }}
                                        onClick={() => {
                                            if (rp?.Title) {
                                                onGScholar(rp.Title);
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })()
                ) : (
                    <div className="result-paper-modal__empty">
                        No paper information available.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResultPaperExplore;
