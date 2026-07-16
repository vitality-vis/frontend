import * as React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faTimes,
  faChartArea,
  faComments,
  faUser,
  faBook,
} from "@fortawesome/free-solid-svg-icons";
import "./../assets/scss/MultiFunctionSearchBar.scss";

/** Tool content in the main workspace (not the Chat sidebar). */
export type MainWorkspaceTool = "similarity" | "visualization";

interface Props {
  /** Synced when the parent clears search or updates externally; not updated on every keystroke */
  corpusSearchInput: string;
  /** Called with the current query when the user presses Enter or Search (avoids re-rendering App on each key) */
  onSubmitCorpusSearch: (query: string) => void;
  /** All titles from metadata cache (global dataset). */
  dataTitles: string[];
  /** Author aggregates from metadata cache (global dataset). */
  authorsSummary: Array<{ _id: string; count: number }>;
  /** Source aggregates from metadata cache (global dataset). */
  sourcesSummary: Array<{ _id: string; count: number }>;
  onClearSearch: () => void;
  /** Whether the Similarity Search workspace panel is shown */
  similarityWorkspaceOpen: boolean;
  /** Whether the Visualization workspace panel is shown (stacked under panels opened earlier) */
  visualizationWorkspaceOpen: boolean;
  /** Whether the chat sidebar is visible */
  chatSidebarOpen: boolean;
  /** Open the Similarity or Visualization panel (independent; both may be open; use header X to hide) */
  onOpenWorkspacePanel: (tool: MainWorkspaceTool) => void;
  /** Toggle chat sidebar; does not clear chat history (state lives in App) */
  onToggleChatSidebar: () => void;
}

export const MultiFunctionSearchBar: React.FC<Props> = (props) => {
  const {
    corpusSearchInput,
    onSubmitCorpusSearch,
    dataTitles,
    authorsSummary,
    sourcesSummary,
    onClearSearch,
    similarityWorkspaceOpen,
    visualizationWorkspaceOpen,
    chatSidebarOpen,
    onOpenWorkspacePanel,
    onToggleChatSidebar,
  } = props;

  const [draft, setDraft] = React.useState(corpusSearchInput);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const wrapRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setDraft(corpusSearchInput);
  }, [corpusSearchInput]);

  React.useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  type PaperSuggestion = { title: string };
  type CountSuggestion = { value: string; count: number };

  const suggestions = React.useMemo(() => {
    const query = draft.trim().toLowerCase();
    if (!query) {
      return {
        papers: [] as PaperSuggestion[],
        authors: [] as CountSuggestion[],
        sources: [] as CountSuggestion[],
      };
    }

    const paperMatches = dataTitles
      .filter((title) => (title || "").toLowerCase().includes(query))
      .sort((a, b) => {
        const aTitle = (a || "").toLowerCase();
        const bTitle = (b || "").toLowerCase();
        const aStarts = aTitle.startsWith(query) ? 1 : 0;
        const bStarts = bTitle.startsWith(query) ? 1 : 0;
        if (aStarts !== bStarts) return bStarts - aStarts;
        const aIdx = aTitle.indexOf(query);
        const bIdx = bTitle.indexOf(query);
        if (aIdx !== bIdx) return aIdx - bIdx;
        return aTitle.length - bTitle.length;
      })
      .slice(0, 12)
      .map((title) => ({
        title: title || "(No title)",
      }));

    const toSorted = (rows: Array<{ _id: string; count: number }>) =>
      rows
        .filter((row) => (row?._id || "").toLowerCase().includes(query))
        .map((row) => [row._id, row.count] as const)
        .sort((a, b) => {
          const aStarts = a[0].toLowerCase().startsWith(query) ? 1 : 0;
          const bStarts = b[0].toLowerCase().startsWith(query) ? 1 : 0;
          if (aStarts !== bStarts) return bStarts - aStarts;
          if (a[1] !== b[1]) return b[1] - a[1];
          return a[0].localeCompare(b[0]);
        })
        .slice(0, 10)
        .map(([value, count]) => ({ value, count }));

    return {
      papers: paperMatches,
      authors: toSorted(authorsSummary || []),
      sources: toSorted(sourcesSummary || []),
    };
  }, [authorsSummary, dataTitles, draft, sourcesSummary]);

  const submit = (query: string) => {
    onSubmitCorpusSearch(query.trim());
    setShowDropdown(false);
  };

  const hasAnySuggestion =
    suggestions.papers.length > 0 ||
    suggestions.authors.length > 0 ||
    suggestions.sources.length > 0;

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit(draft);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const mainToolClass = (isActive: boolean) =>
    `multi-function-search__tool${isActive ? " is-active" : ""}`;

  return (
    <div className="multi-function-search">
      <div className="multi-function-search__row">
        <div className="multi-function-search__input-wrap" ref={wrapRef}>
          <FontAwesomeIcon
            className="multi-function-search__input-icon"
            icon={faSearch}
            aria-hidden
          />
          <input
            type="text"
            className="multi-function-search__input"
            placeholder="Search papers by title, abstract, authors… (Enter or Search)"
            value={draft}
            onFocus={() => setShowDropdown(true)}
            onChange={(e) => {
              setDraft(e.target.value);
              setShowDropdown(true);
            }}
            onKeyDown={onKeyDown}
            aria-label="Search the corpus"
            autoComplete="off"
          />
          {draft ? (
            <button
              type="button"
              className="multi-function-search__clear"
              aria-label="Clear search"
              onClick={() => setDraft("")}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          ) : null}
          {showDropdown && draft.trim().length > 0 ? (
            <div className="multi-function-search__dropdown" role="listbox">
              {hasAnySuggestion ? (
                <>
                  {suggestions.papers.length > 0 ? (
                    <div className="multi-function-search__group">
                      <div className="multi-function-search__group-title">Matching Papers</div>
                      {suggestions.papers.map((paper) => (
                        <button
                          key={`p-${paper.title}`}
                          type="button"
                          className="multi-function-search__item"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setDraft(paper.title);
                            submit(paper.title);
                          }}
                        >
                          <FontAwesomeIcon icon={faBook} aria-hidden />
                          <span>{paper.title}</span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                  {suggestions.authors.length > 0 ? (
                    <div className="multi-function-search__group">
                      <div className="multi-function-search__group-title">Matching Authors</div>
                      {suggestions.authors.map((author) => (
                        <button
                          key={`a-${author.value}`}
                          type="button"
                          className="multi-function-search__item"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setDraft(author.value);
                            submit(author.value);
                          }}
                        >
                          <FontAwesomeIcon icon={faUser} aria-hidden />
                          <span>{author.value}</span>
                          <span className="multi-function-search__count">{author.count}</span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                  {suggestions.sources.length > 0 ? (
                    <div className="multi-function-search__group">
                      <div className="multi-function-search__group-title">Matching Sources</div>
                      {suggestions.sources.map((source) => (
                        <button
                          key={`s-${source.value}`}
                          type="button"
                          className="multi-function-search__item"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setDraft(source.value);
                            submit(source.value);
                          }}
                        >
                          <FontAwesomeIcon icon={faSearch} aria-hidden />
                          <span>{source.value}</span>
                          <span className="multi-function-search__count">{source.count}</span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                  <button
                    type="button"
                    className="multi-function-search__show-all"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => submit(draft)}
                  >
                    See all results for "{draft.trim()}"
                  </button>
                </>
              ) : (
                <div className="multi-function-search__empty">No matching suggestions.</div>
              )}
            </div>
          ) : null}
        </div>
        <button
          type="button"
          className="multi-function-search__submit"
          onClick={() => submit(draft)}
        >
          <FontAwesomeIcon icon={faSearch} aria-hidden />
          <span>Search</span>
        </button>
      </div>
      <div
        className="multi-function-search__tools"
        role="toolbar"
        aria-label="Workspace tools"
      >
        <button
          type="button"
          role="button"
          aria-pressed={similarityWorkspaceOpen}
          className={mainToolClass(similarityWorkspaceOpen)}
          onClick={() => onOpenWorkspacePanel("similarity")}
        >
          <FontAwesomeIcon icon={faSearch} />
          <span>Similarity search</span>
        </button>
        <button
          type="button"
          role="button"
          aria-pressed={visualizationWorkspaceOpen}
          className={mainToolClass(visualizationWorkspaceOpen)}
          onClick={() => onOpenWorkspacePanel("visualization")}
        >
          <FontAwesomeIcon icon={faChartArea} />
          <span>Visualization</span>
        </button>
        <button
          type="button"
          role="button"
          aria-pressed={chatSidebarOpen}
          aria-expanded={chatSidebarOpen}
          className={`multi-function-search__tool${
            chatSidebarOpen ? " is-active" : ""
          }`}
          onClick={() => onToggleChatSidebar()}
        >
          <FontAwesomeIcon icon={faComments} />
          <span>Chat</span>
        </button>
      </div>
    </div>
  );
};

export default MultiFunctionSearchBar;
