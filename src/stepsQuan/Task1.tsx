import StepLayout from "../structure/StepLayout";
import React, { useState, useEffect } from 'react';
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

const Task1 = ({currentStep, totalSteps}) => {
    const [dataAll, setDataAll] = useState<Paper[]>([]);
    const [selectedPapers, setSelectedPapers] = useState<Paper[]>([]);
    const [filteredData, setFilteredData] = useState<Paper[]>([]);
    const [loading, setLoading] = useState(false);
    const [dataAuthors, setDataAuthors] = useState<string[]>([]);
    const [dataSources, setDataSources] = useState<string[]>([]);
    const [dataKeywords, setDataKeywords] = useState<string[]>([]);
    const [minYear, setMinYear] = useState<number>(1975);
    const [maxYear, setMaxYear] = useState<number>(2024);
    const [minCitationCounts, setMinCitationCounts] = useState<number>(0);
    const [maxCitationCounts, setMaxCitationCounts] = useState<number>(1000);
    const [hasMoreData, setHasMoreData] = useState<boolean>(true);
    const [offset, setOffset] = useState<number>(0);
    const [columnFilterValues, setColumnFilterValues] = useState<any[]>([]);
    const [globalFilterValue, setGlobalFilterValue] = useState<any[]>([]);
    const [allDataLoaded, setAllDataLoaded] = useState<boolean>(false);

    // Column filter setup
    const columnFilterTypes = {
        "ID": "default",
        "Title": "default",
        "Authors": "multiselect",
        "Source": "multiselect",
        "Year": "range",
        "Abstract": "default",
        "Keywords": "multiselect",
        "CitationCounts": "range"
    };

    // Load initial data and metadata
    useEffect(() => {
        getMetaData();
        loadMoreData();
    }, []);

    const getMetaData = async () => {
        try {
            const response = await fetch(`${baseUrl}getMetaData`, {
                method: 'GET',
                headers: {'Content-Type': 'application/json'},
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Fetched Metadata:", data);

            // Process metadata like App.tsx does
            let authorsSummary = data.authors_summary || [];
            const authors = authorsSummary.map(item => item._id);

            let sourcesSummary = data.sources_summary || [];
            const sources = sourcesSummary.map(item => item._id);

            let keywordsSummary = data.keywords_summary || [];
            const keywords = keywordsSummary.map(item => item._id);

            let yearsSummary = data.years_summary || [];
            const years = yearsSummary.map(item => item._id);

            const citationCounts = data.citation_counts || [];

            const calculatedMinYear = years.length > 0 ? Math.min(...years) : 1975;
            const calculatedMaxYear = years.length > 0 ? Math.max(...years) : 2024;
            const calculatedMinCitationCounts = citationCounts.length > 0 ? Math.min(...citationCounts) : 0;
            const calculatedMaxCitationCounts = citationCounts.length > 0 ? Math.max(...citationCounts) : 1000;

            setDataAuthors(authors);
            setDataSources(sources);
            setDataKeywords(keywords);
            setMinYear(calculatedMinYear);
            setMaxYear(calculatedMaxYear);
            setMinCitationCounts(calculatedMinCitationCounts);
            setMaxCitationCounts(calculatedMaxCitationCounts);

        } catch (error) {
            console.error("Error fetching metadata:", error);
        }
    };

    const loadMoreData = async () => {
        if (!hasMoreData) return;
        
        setLoading(true);
        try {
            // Process filters like App.tsx does
            const author = columnFilterValues
                .find(f => f.id === 'Authors')?.value?.flat() || [];
            const source = columnFilterValues.find(f => f.id === 'Source')?.value;
            const keyword = columnFilterValues
                .find(f => f.id === 'Keywords')?.value?.flat() || [];
            const yearFilter = columnFilterValues.find(f => f.id === 'Year');
            let minYear = yearFilter ? yearFilter.value[0] : undefined;
            let maxYear = yearFilter ? yearFilter.value[1] : undefined;
            minYear = minYear === 1974 ? undefined : minYear;
            maxYear = maxYear === 2023 ? undefined : maxYear;
            const citationFilter = columnFilterValues.find(f => f.id === 'CitationCounts');
            let minCitationCounts = citationFilter ? citationFilter.value[0] : undefined;
            let maxCitationCounts = citationFilter ? citationFilter.value[1] : undefined;
            minCitationCounts = minCitationCounts === 0 ? undefined : minCitationCounts;
            maxCitationCounts = maxCitationCounts === 1611 ? undefined : maxCitationCounts;
            const searchText = columnFilterValues
                .filter(f => f.id === 'Title')
                .map(f => f.value)
                .join(' ');
            const abstract = columnFilterValues
                .find(f => f.id === 'Abstract')?.value || undefined;

            const queryPayload = {
                limit: 1000,
                offset: offset,
                title: searchText || undefined,
                abstract: abstract || undefined,
                author: author.length > 0 ? author : undefined,
                source: source || undefined,
                keyword: keyword.length > 0 ? keyword : undefined,
                min_year: minYear,
                max_year: maxYear,
                min_citation_counts: minCitationCounts,
                max_citation_counts: maxCitationCounts
            };
            
            console.log('API call payload:', queryPayload);
            
            const response = await fetch(`${baseUrl}getPapers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(queryPayload),
            });
            
            const newData = await response.json();
            console.log('API response - papers loaded:', newData?.length || 0);
            
            if (newData && Array.isArray(newData)) {
                const combinedData = [...dataAll, ...newData];
                const uniqueData = Array.from(new Set(combinedData.map(item => item.ID))).map(
                    id => combinedData.find(item => item.ID === id)
                );
                
                setDataAll(uniqueData);
                setFilteredData(uniqueData);
                setOffset(prev => prev + newData.length);
                setHasMoreData(newData.length === 1000);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadAllData = async () => {
        // Implementation for loading all data if needed
        while (hasMoreData) {
            await loadMoreData();
        }
    };

    const handlePaperSelect = (paper: Paper, isSelected: boolean) => {
        if (isSelected) {
            setSelectedPapers(prev => [...prev, paper]);
        } else {
            setSelectedPapers(prev => prev.filter(p => p.ID !== paper.ID));
        }
    };

    const formatAuthors = (authors: string[]) => {
        if (!authors || authors.length === 0) return "";
        if (authors.length <= 3) return authors.join(", ");
        return `${authors.slice(0, 3).join(", ")}, et al.`;
    };

    const formatKeywords = (keywords: string[]) => {
        if (!keywords || keywords.length === 0) return "";
        if (keywords.length <= 5) return keywords.join(", ");
        return `${keywords.slice(0, 5).join(", ")}, ...`;
    };

    const removeSelectedPaper = (paperId: string) => {
        setSelectedPapers(prev => prev.filter(p => p.ID !== paperId));
    };

    const isSelected = (paperId: string) => {
        return selectedPapers.some(p => p.ID === paperId);
    };

    // SmartTable props for the main search table
    const searchTableProps: SmartTableProps = {
        tableType: "all",
        embeddingType: "default",
        hasEmbeddings: () => false,
        tableData: {
            all: dataAll,
            saved: [],
            similar: [],
            similarPayload: [],
            keyword: [],
            author: [],
            source: [],
            year: []
        },
        columnsVisible: ["Title", "Authors", "Source", "Year", "Abstract", "Keywords"],
        columnIds: ["ID", "Title", "Authors", "Source", "Year", "Abstract", "Keywords"],
        tableControls: ["select"], // Add select checkboxes
        dataFiltered: filteredData,
        dataAuthors: dataAuthors,
        dataSources: dataSources,
        dataKeywords: dataKeywords,
        columnFilterValues: columnFilterValues,
        globalFilterValue: globalFilterValue,
        columnSortByValues: [{ id: 'Year', desc: true }],
        columnFilterTypes: columnFilterTypes,
        updateVisibleColumns: () => {},
        updateColumnFilterValues: (filter) => {
            console.log("Filter applied:", filter);
            if (JSON.stringify(columnFilterValues) === JSON.stringify(filter)) {
                return;
            }
            
            if (!allDataLoaded) {
                // Reset data and load from server with new filters
                setDataAll([]);
                setFilteredData([]);
                setOffset(0);
                setHasMoreData(true);
                setColumnFilterValues(filter);
                
                // Load data with new filters
                setTimeout(() => {
                    loadMoreData();
                }, 0);
            } else {
                // Update filters and let SmartTable handle local filtering
                setColumnFilterValues(filter);
            }
        },
        updateGlobalFilterValue: (filter) => {
            console.log("Global filter applied:", filter);
            setGlobalFilterValue(filter);
        },
        updateColumnSortByValues: () => {},
        setFilteredPapers: (dataFiltered) => {
            console.log("SmartTable filtered data:", dataFiltered?.length || 0);
            setFilteredData(dataFiltered || []);
        },
        addToSavedPapers: () => {},
        addToSimilarInputPapers: () => {},
        addToSelectNodeIDs: (paper: Paper, selected: boolean) => handlePaperSelect(paper, selected),
        isInSavedPapers: () => false,
        isInSimilarInputPapers: () => false,
        isInSelectedNodeIDs: (paperId: string) => isSelected(paperId),
        openGScholar: () => {},
        scrollToPaperID: 0,
        columnWidths: {
            "ID": { maxWidth: 50 },
            "Title": { minWidth: 200 },
            "Authors": { minWidth: 150 },
            "Source": { maxWidth: 200 },
            "Year": { maxWidth: 80 },
            "Abstract": { minWidth: 200 },
            "Keywords": { minWidth: 150 },
            "CitationCounts": { maxWidth: 100 }
        },
        staticMinYear: minYear,
        staticMaxYear: maxYear,
        staticMinCitationCounts: minCitationCounts,
        staticMaxCitationCounts: maxCitationCounts,
        hasMoreData: hasMoreData,
        loadMoreData: loadMoreData,
        loadAllData: loadAllData
    };

    return (
        <StepLayout title={`Task 1 (Step ${currentStep}/${totalSteps})`} showNext>
            <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', padding: '20px' }}>
                <div style={{ maxWidth: 700, margin: "0 auto 20px auto" }}>
                    <h3>Instructions</h3>
                    <p>
                        In the screening questionnaire, you indicated that you had interest in or were
                        working on a certain topic. Using the table below to locate any existing papers in this space
                        you are familiar with.
                    </p>
                </div>
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Search Panel with SmartTable */}
                    <div style={{ flex: 1, border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ background: '#f5f5f5', padding: '10px', borderBottom: '1px solid #ccc' }}>
                            <h4 style={{ margin: 0 }}>Search Papers</h4>
                        </div>
                        <div style={{ height: '400px', overflow: 'auto' }}>
                            <SmartTable props={searchTableProps} setSpinner={(active, text) => {
                                console.log(`Spinner: ${active}, Text: ${text}`);
                                // You could add a spinner state here if needed
                            }} />
                        </div>
                    </div>

                    {/* Selected Papers Panel */}
                    <div style={{ minHeight: '200px', border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ background: '#f5f5f5', padding: '10px', borderBottom: '1px solid #ccc' }}>
                            <h4 style={{ margin: 0 }}>Selected Papers ({selectedPapers.length})</h4>
                        </div>
                        <div style={{ maxHeight: '200px', overflow: 'auto' }}>
                            {selectedPapers.length === 0 ? (
                                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                                    No papers selected. Use the interface above to select papers.
                                </div>
                            ) : (
                                <SmartTable 
                                    props={{
                                        tableType: "all",
                                        embeddingType: "default",
                                        hasEmbeddings: () => false,
                                        tableData: {
                                            all: selectedPapers,
                                            saved: [],
                                            similar: [],
                                            similarPayload: [],
                                            keyword: [],
                                            author: [],
                                            source: [],
                                            year: []
                                        },
                                        columnsVisible: ["Title", "Authors", "Source", "Year", "Abstract", "Keywords"],
                                        columnIds: ["ID", "Title", "Authors", "Source", "Year", "Abstract", "Keywords"],
                                        tableControls: ["delete"], // Add delete control for selected papers
                                        dataFiltered: selectedPapers,
                                        dataAuthors: dataAuthors,
                                        dataSources: dataSources,
                                        dataKeywords: dataKeywords,
                                        columnFilterValues: [],
                                        globalFilterValue: [],
                                        columnSortByValues: [{ id: 'Year', desc: true }],
                                        columnFilterTypes: {},
                                        updateVisibleColumns: () => {},
                                        updateColumnFilterValues: () => {},
                                        updateGlobalFilterValue: () => {},
                                        updateColumnSortByValues: () => {},
                                        setFilteredPapers: () => {},
                                        addToSavedPapers: () => {},
                                        addToSimilarInputPapers: () => {},
                                        addToSelectNodeIDs: () => {},
                                        isInSavedPapers: () => false,
                                        isInSimilarInputPapers: () => false,
                                        isInSelectedNodeIDs: () => false,
                                        deleteRow: (rowIndex: number) => {
                                            const paperToRemove = selectedPapers[rowIndex];
                                            if (paperToRemove) {
                                                removeSelectedPaper(paperToRemove.ID);
                                            }
                                        },
                                        openGScholar: () => {},
                                        scrollToPaperID: 0,
                                        columnWidths: {
                                            "ID": { maxWidth: 50 },
                                            "Title": { minWidth: 200 },
                                            "Authors": { minWidth: 150 },
                                            "Source": { maxWidth: 200 },
                                            "Year": { maxWidth: 80 },
                                            "Abstract": { minWidth: 200 },
                                            "Keywords": { minWidth: 150 },
                                            "CitationCounts": { maxWidth: 100 }
                                        },
                                        staticMinYear: minYear,
                                        staticMaxYear: maxYear,
                                        staticMinCitationCounts: minCitationCounts,
                                        staticMaxCitationCounts: maxCitationCounts,
                                        hasMoreData: false,
                                        loadMoreData: async () => {},
                                        loadAllData: async () => {}
                                    }}
                                    setSpinner={() => {}}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </StepLayout>
    );
};

export default Task1;