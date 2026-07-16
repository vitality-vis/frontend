import * as React from "react";
import { DefaultButton, IconButton } from "@fluentui/react";
import "./../assets/scss/CorpusResultsList.scss";

const PAGE_SIZE = 20;

export interface PaperRow {
  ID: number;
  Title?: string;
  Authors?: string[];
  Year?: number;
  CitationCounts?: number;
  Source?: string;
}

export interface CorpusPaperActions {
  onAsk: (paper: PaperRow) => void;
  onLocate: (paper: PaperRow) => void;
  onAddSimilar: (paper: PaperRow) => void;
  onSave: (paper: PaperRow) => void;
  isLocateDisabled: (paper: PaperRow) => boolean;
  isSimilarDisabled: (paper: PaperRow) => boolean;
  isSaveDisabled: (paper: PaperRow) => boolean;
}

/** Alternate per-row actions used by the saved-papers (Literature Review) list. */
export interface CorpusSavedActions {
  onAsk: (paper: PaperRow) => void;
  onSummarize: (paper: PaperRow) => void;
  onDelete: (paper: PaperRow) => void;
}

interface Props {
  papers: PaperRow[];
  selectedPaperId: number | null;
  /** Click paper title — full “explore” reading view with prev/next. */
  onTitleClick: (paper: PaperRow) => void;
  /** Click ⓘ — compact metadata + actions (summary view). */
  onPaperInfoClick: (paper: PaperRow) => void;
  /** Same actions as paper rows in chat (Dialog.renderPaperBlock) */
  paperActions?: CorpusPaperActions;
  /** Saved-papers actions (Summarize / Delete). When provided, these replace paperActions. */
  savedActions?: CorpusSavedActions;
  /** When this string changes, pagination resets to page 1 (e.g. active corpus search). */
  paginationResetKey?: string;
}

function formatAuthors(authors: string[] | undefined): string {
  if (!authors || !authors.length) {
    return "—";
  }
  if (authors.length <= 2) {
    return authors.join(", ");
  }
  return `${authors[0]} et al.`;
}

const actionBtnStyles = {
  root: { marginRight: "0.35em", minWidth: 0 },
};

export const CorpusResultsList: React.FC<Props> = ({
  papers,
  selectedPaperId,
  onTitleClick,
  onPaperInfoClick,
  paperActions,
  savedActions,
  paginationResetKey = "",
}) => {
  const total = papers.length;
  const [page, setPage] = React.useState(1);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  React.useEffect(() => {
    setPage(1);
  }, [total, paginationResetKey]);

  const safePage = total === 0 ? 1 : Math.min(Math.max(1, page), pageCount);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const rangeStart = total === 0 ? 0 : startIdx + 1;
  const rangeEnd = total === 0 ? 0 : Math.min(startIdx + PAGE_SIZE, total);

  const listScrollRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (total === 0) {
      return;
    }
    listScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [safePage, total]);

  if (!total) {
    return (
      <div className="corpus-results corpus-results--empty" role="status">
        <p className="corpus-results__empty">
          No papers match the current search.
        </p>
        <p className="corpus-results__hint">
          Clear the search bar or press Search with an empty field to show all
          loaded papers.
        </p>
      </div>
    );
  }

  const pagePapers = papers.slice(startIdx, startIdx + PAGE_SIZE);

  return (
    <div className="corpus-results-layout">
      <div ref={listScrollRef} className="corpus-results-layout__scroll">
        <ul className="corpus-results" aria-label="Search results">
      {pagePapers.map((paper) => {
        const id = paper.ID;
        const selected = selectedPaperId === id;
        const titleText = paper.Title || "(No title)";
        return (
          <li key={id}>
            <div
              className={`corpus-results__card${
                selected ? " is-selected" : ""
              }`}
            >
              <div className="corpus-results__title-row">
                <button
                  type="button"
                  className="corpus-results__title-hit"
                  onClick={() => onTitleClick(paper)}
                  aria-current={selected ? "true" : undefined}
                >
                  <span className="corpus-results__title">{titleText}</span>
                </button>
                <button
                  type="button"
                  className="corpus-results__info-btn"
                  title="Quick details"
                  aria-label={`Quick details: ${titleText}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPaperInfoClick(paper);
                  }}
                >
                  <svg
                    className="corpus-results__info-btn-svg"
                    viewBox="0 0 16 16"
                    width={18}
                    height={18}
                    aria-hidden
                  >
                    <circle
                      cx="8"
                      cy="8"
                      r="6.75"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.25"
                    />
                    <text
                      x="8"
                      y="11"
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="600"
                      fill="currentColor"
                      fontFamily="system-ui, sans-serif"
                    >
                      i
                    </text>
                  </svg>
                </button>
              </div>

              {savedActions ? (
                <div
                  className="corpus-results__actions"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  <DefaultButton
                    iconProps={{ iconName: "Chat" }}
                    text="Ask"
                    styles={actionBtnStyles}
                    onClick={(e) => {
                      e.stopPropagation();
                      savedActions.onAsk(paper);
                    }}
                  />
                  <DefaultButton
                    iconProps={{ iconName: "TextDocument" }}
                    text="Summarize"
                    styles={actionBtnStyles}
                    onClick={(e) => {
                      e.stopPropagation();
                      savedActions.onSummarize(paper);
                    }}
                  />
                  <DefaultButton
                    iconProps={{ iconName: "Delete" }}
                    title="Delete"
                    ariaLabel="Delete paper"
                    styles={actionBtnStyles}
                    onClick={(e) => {
                      e.stopPropagation();
                      savedActions.onDelete(paper);
                    }}
                  />
                </div>
              ) : paperActions ? (
                <div
                  className="corpus-results__actions"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  <DefaultButton
                    iconProps={{ iconName: "Chat" }}
                    text="Ask"
                    styles={actionBtnStyles}
                    onClick={(e) => {
                      e.stopPropagation();
                      paperActions.onAsk(paper);
                    }}
                  />
                  <DefaultButton
                    iconProps={{ iconName: "Locate" }}
                    styles={actionBtnStyles}
                    disabled={paperActions.isLocateDisabled(paper)}
                    onClick={(e) => {
                      e.stopPropagation();
                      paperActions.onLocate(paper);
                    }}
                  />
                  <DefaultButton
                    iconProps={{ iconName: "PlusCircle" }}
                    styles={actionBtnStyles}
                    disabled={paperActions.isSimilarDisabled(paper)}
                    onClick={(e) => {
                      e.stopPropagation();
                      paperActions.onAddSimilar(paper);
                    }}
                  />
                  <DefaultButton
                    iconProps={{ iconName: "Save" }}
                    styles={actionBtnStyles}
                    disabled={paperActions.isSaveDisabled(paper)}
                    onClick={(e) => {
                      e.stopPropagation();
                      paperActions.onSave(paper);
                    }}
                  />
                </div>
              ) : null}

              <div className="corpus-results__meta-block">
                <div className="corpus-results__meta">
                  <span className="corpus-results__authors">
                    {formatAuthors(paper.Authors)}
                  </span>
                  {paper.Year != null && (
                    <span className="corpus-results__year">{paper.Year}</span>
                  )}
                </div>
                <div className="corpus-results__stats">
                  {paper.CitationCounts != null && (
                    <span>Citations {paper.CitationCounts}</span>
                  )}
                  {paper.Source && (
                    <span className="corpus-results__source">{paper.Source}</span>
                  )}
                </div>
              </div>
            </div>
          </li>
        );
      })}
        </ul>
      </div>
      <footer className="corpus-results__pager" aria-label="Results pagination">
        <IconButton
          iconProps={{ iconName: "ChevronLeft" }}
          title="Previous page"
          aria-label="Previous page"
          disabled={safePage <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="corpus-results__pager-btn"
        />
        <span className="corpus-results__pager-range">
          {rangeStart} – {rangeEnd} of {total}
        </span>
        <IconButton
          iconProps={{ iconName: "ChevronRight" }}
          title="Next page"
          aria-label="Next page"
          disabled={safePage >= pageCount}
          onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
          className="corpus-results__pager-btn"
        />
      </footer>
    </div>
  );
};

export default CorpusResultsList;
