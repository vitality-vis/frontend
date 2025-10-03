import StepLayout from "../structure/StepLayout";
import React, { useState, useEffect, useMemo } from "react";
import SmartTable, { SmartTableProps } from "../components/SmartTable";
import { baseUrl } from "../components/App";

interface Paper {
  ID: string;
  Title: string;
  Authors: string[];
  Source: string;
  Year: number;
  Abstract: string;
  Keywords: string[];
  CitationCounts?: number;
}

const STORAGE_KEY = "saved_papers";

const Task1: React.FC<{ currentStep: number; totalSteps: number }> = ({
  currentStep,
  totalSteps,
}) => {
  const [filteredData, setFilteredData] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataAuthors, setDataAuthors] = useState<string[]>([]);
  const [dataSources, setDataSources] = useState<string[]>([]);
  const [dataKeywords, setDataKeywords] = useState<string[]>([]);
  const [minYear, setMinYear] = useState<number>(1975);
  const [maxYear, setMaxYear] = useState<number>(2024);
  const [minCitationCounts, setMinCitationCounts] = useState<number>(0);
  const [maxCitationCounts, setMaxCitationCounts] = useState<number>(1000);
  const [columnFilterValues, setColumnFilterValues] = useState<any[]>([]);
  const [globalFilterValue, setGlobalFilterValue] = useState<any[]>([]);

  // ---- Saved papers (persist to localStorage so the App step can hydrate them) ----
  const [saved, setSaved] = useState<Paper[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Paper[]) : [];
    } catch {
      return [];
    }
  });
  const savedIds = useMemo(() => new Set(saved.map((p) => p.ID)), [saved]);

  const persistSaved = (next: Paper[]) => {
    setSaved(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  const addToSaved = (paper: Paper) => {
    if (!savedIds.has(paper.ID)) persistSaved([...saved, paper]);
  };
  const removeFromSaved = (paperId: string) => {
    if (savedIds.has(paperId)) persistSaved(saved.filter((p) => p.ID !== paperId));
  };
  const isInSaved = (paper: Paper) => savedIds.has(paper.ID);

  // -------------------------------------------------------------------------------

  useEffect(() => {
    void getMetaData();
  }, []);

  // This effect will re-run whenever columnFilterValues changes
  useEffect(() => {
    void loadData();
  }, [columnFilterValues]);


  const getMetaData = async () => {
    try {
      const response = await fetch(`${baseUrl}getMetaData`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      const authors = (data.authors_summary || []).map((x: any) => x._id);
      const sources = (data.sources_summary || []).map((x: any) => x._id);
      const keywords = (data.keywords_summary || []).map((x: any) => x._id);
      const years = (data.years_summary || []).map((x: any) => x._id);
      const citationCounts: number[] = data.citation_counts || [];

      setDataAuthors(authors);
      setDataSources(sources);
      setDataKeywords(keywords);
      setMinYear(years.length ? Math.min(...years) : 1975);
      setMaxYear(years.length ? Math.max(...years) : 2024);
      setMinCitationCounts(citationCounts.length ? Math.min(...citationCounts) : 0);
      setMaxCitationCounts(citationCounts.length ? Math.max(...citationCounts) : 1000);
    } catch (e) {
      console.error("Error fetching metadata:", e);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const author = columnFilterValues.find((f) => f.id === "Authors")?.value || [];
      const source = columnFilterValues.find((f) => f.id === "Source")?.value;
      const keyword = columnFilterValues.find((f) => f.id === "Keywords")?.value || [];
      const yearFilter = columnFilterValues.find((f) => f.id === "Year");
      let minY = yearFilter ? yearFilter.value[0] : undefined;
      let maxY = yearFilter ? yearFilter.value[1] : undefined;
      minY = minY === 1974 ? undefined : minY;
      maxY = maxY === 2023 ? undefined : maxY;
      const citationFilter = columnFilterValues.find((f) => f.id === "CitationCounts");
      let minC = citationFilter ? citationFilter.value[0] : undefined;
      let maxC = citationFilter ? citationFilter.value[1] : undefined;
      minC = minC === 0 ? undefined : minC;
      maxC = maxC === 1611 ? undefined : maxC;
      const title = columnFilterValues.filter((f) => f.id === "Title").map((f) => f.value).join(" ");
      const abstract = columnFilterValues.find((f) => f.id === "Abstract")?.value || undefined;

      const payload = {
        limit: 30,
        offset: 0,
        title: title || undefined,
        abstract: abstract || undefined,
        author: author.length ? author : undefined,
        source: source || undefined,
        keyword: keyword.length ? keyword : undefined,
        min_year: minY,
        max_year: maxY,
        min_citation_counts: minC,
        max_citation_counts: maxC,
      };

      const resp = await fetch(`${baseUrl}getPapers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const newData: Paper[] = await resp.json();

      if (Array.isArray(newData)) {
        const limited = newData.slice(0, 30);
        setFilteredData(limited);
      }
    } catch (e) {
      console.error("Error loading data:", e);
    } finally {
      setLoading(false);
    }
  };

  // ---- SmartTable props ----
  const columnFilterTypes = {
    ID: "default",
    Title: "default",
    Authors: "multiselect-tokens",
    Source: "multiselect",
    Year: "range",
    Abstract: "default",
    Keywords: "multiselect-tokens",
    CitationCounts: "range",
  };

  const searchTableProps: SmartTableProps = {
    tableType: "all",
    embeddingType: "default",
    hasEmbeddings: () => false,

    tableData: {
      all: filteredData,
      saved: saved,
      similar: [],
      similarPayload: [],
      keyword: [],
      author: [],
      source: [],
      year: [],
    },

    columnsVisible: ["Title", "Authors", "Source", "Year", "Abstract", "Keywords"],
    columnIds: ["ID", "Title", "Authors", "Source", "Year", "Abstract", "Keywords"],
    tableControls: ["select"],

    dataFiltered: filteredData,
    dataAuthors,
    dataSources,
    dataKeywords,

    columnFilterValues,
    globalFilterValue,
    columnSortByValues: [{ id: "Year", desc: true }],
    columnFilterTypes,

    updateVisibleColumns: () => {},
    updateColumnFilterValues: setColumnFilterValues,
    updateGlobalFilterValue: setGlobalFilterValue,
    updateColumnSortByValues: () => {},

    setFilteredPapers: (df) => setFilteredData(df || []),

    addToSavedPapers: (paper: Paper) => addToSaved(paper),
    addToSimilarInputPapers: () => {},
    addToSelectNodeIDs: (paper: Paper, selected: boolean) => {
        const paperToToggle = filteredData.find(p => p.ID === paper.ID);
        if (paperToToggle) {
            selected ? addToSaved(paperToToggle) : removeFromSaved(paperToToggle.ID);
        }
    },

    isInSavedPapers: (paper: Paper) => isInSaved(paper),
    isInSimilarInputPapers: () => false,
    isInSelectedNodeIDs: (paperId: string) => savedIds.has(paperId),

    openGScholar: () => {},
    scrollToPaperID: 0,

    columnWidths: {
      ID: { maxWidth: 50 },
      Title: { minWidth: 200 },
      Authors: { minWidth: 150 },
      Source: { maxWidth: 200 },
      Year: { maxWidth: 80 },
      Abstract: { minWidth: 200 },
      Keywords: { minWidth: 150 },
      CitationCounts: { maxWidth: 100 },
    },

    staticMinYear: minYear,
    staticMaxYear: maxYear,
    staticMinCitationCounts: minCitationCounts,
    staticMaxCitationCounts: maxCitationCounts,

    hasMoreData: false,
    loadMoreData: async () => {},
    loadAllData: async () => {},
  };

  return (
    <StepLayout title={`Task 1 (Step ${currentStep}/${totalSteps})`} showNext>
      <div style={{ height: "calc(100vh - 120px)", display: "flex", flexDirection: "column", padding: 20 }}>
        <div style={{ maxWidth: 700, margin: "0 auto 20px auto" }}>
          <h3>Instructions</h3>
          <p>
            Using the table below, check the papers you already know in this topic. Checked papers are saved and
            appear below, and they’ll carry forward to later steps.
          </p>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Search + select */}
          <div style={{ flex: 1, border: "1px solid #ccc", borderRadius: 4, display: "flex", flexDirection: "column" }}>
            {/* <div style={{ background: "#f5f5f5", padding: 10, borderBottom: "1px solid #ccc", flexShrink: 0 }}>
              <h4 style={{ margin: 0 }}>Search Papers</h4>
            </div> */}
            <div style={{ flex: 1, minHeight: 0 }}>
              <SmartTable
                props={searchTableProps}
                setSpinner={(active) => {
                  setLoading(active);
                }}
              />
            </div>
          </div>

          {/* Selected (Saved) papers */}
          <div style={{ flexShrink: 0, border: "1px solid #ccc", borderRadius: 4, display: "flex", flexDirection: "column" }}>
            <div style={{ background: "#f5f5f5", padding: 10, borderBottom: "1px solid #ccc" }}>
              <h4 style={{ margin: 0 }}>Selected Papers ({saved.length})</h4>
            </div>
            <div style={{ maxHeight: 220, overflow: "auto" }}>
              {saved.length === 0 ? (
                <div style={{ padding: 20, textAlign: "center", color: "#666" }}>
                  No papers selected. Use the checkboxes above.
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", padding: "6px 8px" }}>Title</th>
                      <th style={{ textAlign: "left", padding: "6px 8px" }}>Authors</th>
                      <th style={{ textAlign: "left", padding: "6px 8px" }}>Source</th>
                      <th style={{ textAlign: "left", padding: "6px 8px" }}>Year</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {saved.map((p) => (
                      <tr key={p.ID}>
                        <td style={{ padding: "6px 8px", borderTop: "1px solid #eee" }}>{p.Title}</td>
                        <td style={{ padding: "6px 8px", borderTop: "1px solid #eee" }}>
                          {(p.Authors || []).join(", ")}
                        </td>
                        <td style={{ padding: "6px 8px", borderTop: "1px solid #eee" }}>{p.Source}</td>
                        <td style={{ padding: "6px 8px", borderTop: "1px solid #eee" }}>{p.Year}</td>
                        <td style={{ padding: "6px 8px", borderTop: "1px solid #eee", textAlign: "right" }}>
                          <button onClick={() => removeFromSaved(p.ID)}>Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </StepLayout>
  );
};

export default Task1;