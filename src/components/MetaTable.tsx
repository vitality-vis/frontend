/* eslint no-console: 0 */
import "./../assets/scss/MetaTable.scss";
import * as React from "react";
import {VariableSizeList} from 'react-window';
import * as JsSearch from 'js-search';
import styled from 'styled-components';
import {Button} from 'react-bootstrap';

import {
    useTable,
    useSortBy,
    useFilters,
    useGroupBy,
    useExpanded,
    useRowSelect,
    useGlobalFilter,
    useFlexLayout,
    useResizeColumns
} from 'react-table';
import {
    DefaultButton,
    TextField,
    Callout,
    DelayedRender,
    Modal,
    Stack,
    PrimaryButton,
    Dropdown,
    ActionButton,
    Icon,
    IconButton,
    IDropdownOption,
    SearchBox,
    Text,
    TooltipHost,
    TooltipDelay,
    DirectionalHint,
    ITooltipStyles
} from "@fluentui/react";
import {observer} from "mobx-react";
import Slider from '@material-ui/core/Slider';
import "react-select/dist/react-select.css";
import "react-virtualized-select/styles.css";
import VirtualizedSelect from 'react-virtualized-select';
import createFilterOptions from "react-select-fast-filter-options";
import * as d3 from 'd3';
import {useCallback, useEffect, useRef, useState} from "react";
import {uniqueId} from "lodash";

const indexStrategy = new JsSearch.PrefixIndexStrategy();

const Styles = styled.div`

  /* This is required to make the table full-width */
  /*  
    display: block;
    max-width: 100%;
    overflow: auto;
  */

  /* This will make the table scrollable when it gets too small */
  /*  .tableWrap {
      display: block;
      max-width: 100%;
      overflow-x: scroll;
      overflow-y: hidden;
    }
  */

  .p-td {
    padding: 0.5rem;
  }

  .scrollToEl {
    background: #bbdefb;
  }

  .table {
    width: 100%;
    display: inline-block;
    border-spacing: 0;
    border: 1px solid #999;

    .tags li {
      display: inline-block;
    }

    .tags {
      list-style: none;
      overflow-x: auto;
      padding: 0;
      margin: 0;
      display: inline;
      white-space: nowrap;
      // overflow: hidden; 
    }

    .tag {
      background: #efefef;
      border-radius: 3px 0 0 3px;
      color: #000000;
      height: 25px;
      line-height: 25px;
      padding: 0 8px 0 8px;
      position: relative;
      margin: 0 5px 5px 0;
    }

    .tag:hover {
      // cursor: pointer;
      background: #cccccc;
    }

    span {
      font-family: 'Titillium Web';
    }

    /*.tr {
      :last-child {
        .td {
          border-bottom: 0;
        }
      }
    }*/

    /* The first row is special, has a global search and other control widgets.*/

    .tr {
      :not(:first-child) {
        .th {
          text-align: center;
        }
      }
    }

    .th {
      padding: 0.5rem;
    }

    .th, .td {
      overflow-x: hidden !important;
    }

    .th:hover, .td:hover {
      overflow-x: auto !important;
    }

    .th,
    .td {
      margin: 0;
      border-bottom: 1px solid #aaa;
      border-right: 1px solid #aaa;
      white-space: nowrap;
      /*overflow-x: auto;*/
      overflow-y: hidden;

      :last-child {
        border-right: 0;
      }

      .resizer {
        display: inline-block;
        background: #aaa;
        width: 3px;
        height: 100%;
        position: absolute;
        right: 0;
        top: 0;
        cursor: col-resize;
        transform: translateX(50%);
        z-index: 1;
      ${'' /* prevents from scrolling while dragging on touch devices */}
        touch-action: none;

        &.isResizing {
          background: red;
        }
      }
    }

    .td {
      input {
        font-size: 1rem;
        padding: 0;
        margin: 0;
        border: 0;
      }
    }
  }
`

const EditableCell = ({
                          metaMax,
                          metaColorScale,
                          value: initialValue,
                          row: row,
                          tableType: tableType,
                          scrollToPaperID: scrollToPaperID,
                          column: {id, setFilter}
                      }) => {
    let highlightClass = "";
    if (row.original.ID === scrollToPaperID && tableType == "all") {
        highlightClass = "scrollToEl";
    }

    try {
        if (Array.isArray(initialValue)) {
            return <div className={["p-td", highlightClass].join(" ")}>
                <ul className="tags">
                    {initialValue.map(function (t: any) {
                        return <li
                            // onClick={()=> { setFilter(t); }}
                            key={t}><span className="tag">{t}</span></li>
                    })}
                </ul>
            </div>
        }
    } catch (e) {
    }

    if (["KeywordCount", "AuthorCount", "YearCount", "SourceCount","Count"].indexOf(id) !== -1) {
        // console.log("barCalculating");
        const val = initialValue / metaMax[id];
        const color = metaColorScale[id](initialValue);

        const backgroundSize = `${val * 100}% 100%, ${100 - val * 100}% 100%`;
        const backgroundImage = `linear-gradient(${color}, ${color}), linear-gradient(white, white)`;

        return <div className="p-td"
                    style={{color: val > 0.8 ? "white" : "black", backgroundRepeat: "no-repeat", backgroundImage: backgroundImage, backgroundSize: backgroundSize}}>{initialValue}</div>;
    }

    if (["Sim"].indexOf(id) !== -1) {

        const val = initialValue / 1; // Max Similarity Value = 1
        const color = metaColorScale[id](initialValue);

        const backgroundSize = `${val * 100}% 100%, ${100 - val * 100}% 100%`;
        const backgroundImage = `linear-gradient(${color}, ${color}), linear-gradient(white, white)`;

        return <div className="p-td"
                    style={{color: val > 0.8 ? "white" : "black", backgroundRepeat: "no-repeat", backgroundImage: backgroundImage, backgroundSize: backgroundSize}}>{initialValue}</div>;
    }

    if (['Source', 'Author', 'Keyword'].indexOf(id) !== -1) {
        return <div className={["p-td", highlightClass].join(" ")}><span
            // onClick={() => setFilter([initialValue])}
            className="tag">{initialValue}</span></div>
    } else if (["Year"].indexOf(id) !== -1) {
        return <div className={["p-td", highlightClass].join(" ")}><span
            // onClick={() => { setFilter([parseInt(initialValue), parseInt(initialValue)])}}
            className="tag">{initialValue}</span></div>
    } else {
        return <div className={["p-td", highlightClass].join(" ")}>{initialValue}</div>;
    }
}

function GlobalFilter({
                          globalFilter,
                          setGlobalFilter,
                      }) {
    const [globalFilterValue, setGlobalFilterValue] = React.useState(globalFilter);
    const onChange = (value) => {
        setGlobalFilter(value || undefined)
    }

    return (
        <SearchBox
            onClear={() => {
                setGlobalFilter(undefined) // Set undefined to remove the filter entirely
            }}
            clearButtonProps={{iconProps: {iconName: "Times"}}}
            styles={{root: {width: 200, display: "inline-flex", verticalAlign: "top"}}}
            placeholder="Search"
            value={globalFilterValue}
            onSearch={(newValue) => {
                setGlobalFilterValue(newValue);
                onChange(newValue);
            }}
            onChange={(_, newValue) => {
                setGlobalFilterValue(newValue);
            }}
        />
    )
}

function NumberRangeColumnFilter({
                                     column: { filterValue, setFilter, id },
                                     min ,
                                     max
                                 }){
    const defaultRange = [1974, 2023]; // Provide general defaults if min/max are not defined
    const range = (min !== undefined && max !== undefined) ? [min, max] : defaultRange;

    const [value, setValue] = useState(filterValue?.length ? filterValue : range);

    React.useEffect(() => {
        // console.log("trigger filterValue update ")
        if (filterValue && filterValue.length > 0) {
            setValue(filterValue);
        }
    }, [filterValue]);

    const [step, marks] = React.useMemo(() => {
        const step = range[1] > 2 ? 1 : 0.001;
        const uniqueMarks = Array.from(new Set([
            { value: range[0], label: range[0].toString() },
            { value: value[0], label: value[0].toString() },
            { value: value[1], label: value[1].toString() },
            { value: range[1], label: range[1].toString() },
        ])); // Remove duplicates to ensure unique keys

        return [step, uniqueMarks];
    }, [value, range]);

    function valueText(value: number, index: number) {
        return value != 0 ? `${value.toPrecision(4)}` : '';
    }

    return (
        <div style={{marginLeft: 16, marginRight: 16, textAlign: "center"}}
        >
            <Slider
                defaultValue={value}
                value={value}
                step={step}
                min={range[0]}
                max={range[1]}
                onChangeCommitted={(event, val) => setFilter(val)}
                onChange={(event, val) => setValue(val)}
                valueLabelDisplay="auto"
                aria-labelledby="range-slider"
                getAriaValueText={valueText}
                marks={marks}
                key={`slider-${id}`}
            />
        </div>
    )
}

function MultiSelectTokensColumnFilter({
                                           column: {setFilter, preFilteredRows, id, filterValue},dataAuthors, dataSources,dataKeywords
                                       }) {
    // Calculate the options for filtering
    // using the preFilteredRows
    let options = [];
    if (id === 'Author' && dataAuthors) {
        // Use the passed set of authors
        options = [...new Set(dataAuthors)].sort();
    } else if (id === 'Source' && dataSources) {
        // Use the passed set of sources
        options = [...new Set(dataSources)].sort();
    } else if (id === 'Keyword'&&dataKeywords){
        options = [...new Set(dataKeywords)].sort();
        // console.log("options",options)
    }
    else {
        options = React.useMemo(() => {
            const options = new Set();
            preFilteredRows.forEach(row => {
                if ("values" in row && id in row["values"] && row["values"][id] != null) {
                    row.values[id].forEach((token) => {
                        if (token && token.length > 0) {
                            options.add(token);
                        }
                    });
                }
            });
            return [...options.values()].sort(function (a: any, b: any) {
                return (a < b) ? -1 : (a > b) ? 1 : 0;
            });
        }, [preFilteredRows]);
    }

    const [multiselectTokenSelectedOptions, setMultiSelectTokenSelectedOptions]: any = React.useState([]);

    const onChange = (selectedOptions): void => {
        const selectedValues = selectedOptions.map(option => option.value);

        if (JSON.stringify(selectedValues) !== JSON.stringify(filterValue)) {
            setMultiSelectTokenSelectedOptions(selectedOptions);
            setFilter(selectedValues.length > 0 ? selectedValues : undefined);
        }
    }

    React.useEffect(() => {
        // console.log("trigger longer preFilterRows filterValue update");
        if (filterValue && !Array.isArray(filterValue)) {
            const _selOptions = [{ label: filterValue, value: filterValue }];
            if (JSON.stringify(_selOptions) !== JSON.stringify(multiselectTokenSelectedOptions)) {
                setMultiSelectTokenSelectedOptions(_selOptions);
            }

            const filteredValues = preFilteredRows
                .filter(row =>
                    "values" in row &&
                    id in row["values"] &&
                    row["values"][id] != null &&
                    row.values[id].some(r => filterValue == r)
                )
                .map(row => row.values[id]);

            // console.log('filteredValues:', filteredValues);
            setFilter(filteredValues.length > 0 ? filteredValues : undefined);
        }
    }, [filterValue, preFilteredRows, id, multiselectTokenSelectedOptions]);


    // Create Options
    const _options = React.useMemo(() => {
        return options.map((o: string) => {
            return {label: o, value: o};
        });
    }, [options]);

    const _filterOptions = React.useMemo(() => {
        return createFilterOptions({
            options: _options,
            indexStrategy: indexStrategy
        });
    }, [_options]);

    // Render a multi-select box
    return (
        <VirtualizedSelect
            options={_options}
            filterOptions={_filterOptions}
            multi
            isSearchable={true}
            clearable={true}
            placeholder={"Search"}
            maxHeight={100}
            value={multiselectTokenSelectedOptions}
            onChange={onChange}
            defaultValue={multiselectTokenSelectedOptions}
        />
    )
}

function MultiSelectColumnFilter({
                                     column: {filterValue, setFilter, preFilteredRows, id}, dataAuthors, dataSources,dataKeywords
                                 }) {
    // Calculate the options for filtering
    // using the preFilteredRows
    let options = [];
    // console.log('inner metadata', metadata)
    if (id === 'Author' && dataAuthors) {
        // Use the passed set of authors
        options = [...new Set(dataAuthors)].sort();
    } else if (id === 'Source' && dataSources) {
        // Use the passed set of sources
        options = [...new Set(dataSources)].sort();
    } else if (id==='Keyword'&& dataKeywords){
        options = [...new Set(dataKeywords)].sort();
    }
    else {
        // Default behavior for other columns or if dataAuthors/dataSources are not available
        options = React.useMemo(() => {
            const options = new Set();
            preFilteredRows.forEach(row => {
                if ("values" in row && id in row["values"] && row["values"][id] != null) {
                    options.add(row.values[id]);
                }
            });
            return [...options.values()].sort(function (a: any, b: any) {
                return (a < b) ? -1 : (a > b) ? 1 : 0;
            });
        }, [preFilteredRows]);
    }
    const _options = React.useMemo(() => {
        return options.map((o: string) => ({label: o, value: o}));
    }, [options]);
    const [multiselectTokenSelectedOptions, setMultiSelectTokenSelectedOptions] = React.useState<any[]>([]);
    const onChange = (selectedOptions): void => {
        const filteredValues = preFilteredRows
            .filter(row => {
                const rowValues = Array.isArray(row.values[id]) ? row.values[id] : [row.values[id]];
                return rowValues.some(r => selectedOptions.some(option => option.value === r));
            })
            .map(row => row.values[id]);
        // console.log("Selected Options_ColumnFilter:", selectedOptions); // Log selected options
        // console.log("Filtered Values before Set:", filteredValues); // Log values before uniqueness

        const uniqueFilteredValues = [...new Set(filteredValues)];
        // console.log("Filtered Values after Set:", uniqueFilteredValues); // Log unique filtered values


        setMultiSelectTokenSelectedOptions(selectedOptions);
        setFilter(selectedOptions.map(option => option.value));
    }

    React.useEffect(() => {
        // console.log('trigger filter value update on setMultiSelectTokenSelectedOptions');
        // console.log('filterValue',filterValue);
        if (filterValue) {
            const _selOptions = Array.isArray(filterValue) ? filterValue.map(f => ({label: f, value: f})) : [];
            setMultiSelectTokenSelectedOptions(_selOptions);
        }
    }, [filterValue]);

    // Render a multi-select box
    return (
        <VirtualizedSelect
            options={_options}
            // filterOptions={_filterOptions}
            multi
            isSearchable={true}
            clearable={true}
            placeholder={"Search"}
            maxHeight={100}
            value={multiselectTokenSelectedOptions}
            onChange={onChange}
            defaultValue={multiselectTokenSelectedOptions}
        />
    )
}

function DefaultColumnFilter({
                                 column: {filterValue, setFilter},
                             }) {
    return (
        <SearchBox
            onClear={() => {
                setFilter(undefined) // Set undefined to remove the filter entirely
            }}
            clearButtonProps={{iconProps: {iconName: "Times"}}}
            value={filterValue || ''}
            placeholder="Search"
            onSearch={(newValue) => {
                setFilter(newValue || undefined) // Set undefined to remove the filter entirely
            }}
            // onChange={(_, newValue) => {
            //   setFilter(newValue || undefined) // Set undefined to remove the filter entirely
            // }}
        />)
}

function filterMapping(filter, dataAuthors, dataSources, dataKeywords, columnId, staticMinYear = 1975, staticMaxYear = 2024, staticMinCitationCounts = 0, staticMaxCitationCounts = 1000,columnData) {
    if (filter === "multiselect") {
        return { Filter: (props) => <MultiSelectColumnFilter {...props} dataAuthors={dataAuthors} dataSources={dataSources} dataKeywords={dataKeywords} />, filter: 'includesValue' };
    } else if (filter === "default") {
        return { Filter: DefaultColumnFilter, filter: 'fuzzyText' };
    } else if (filter === "range") {
        let min, max;
        if (columnId === "Count") {
            // Dynamically calculate min and max from the data
            min = Math.min(...columnData);
            max = Math.max(...columnData);
        }return {
            Filter: (props) => (
                <NumberRangeColumnFilter
                    {...props}
                    id={columnId}
                    min={min ?? undefined}
                    max={max ?? undefined}
                />
            ),
            filter: "between",
        };
        // Check if the column is Year or CitationCount to apply specific ranges
        min = columnId === 'Year' ? staticMinYear : columnId === 'CitationCount' ? staticMinCitationCounts : undefined;
        max = columnId === 'Year' ? staticMaxYear : columnId === 'CitationCount' ? staticMaxCitationCounts : undefined;
        return {
            Filter: (props) => (
                <NumberRangeColumnFilter
                    {...props}
                    id={columnId}
                    min={min ?? undefined}
                    max={max ?? undefined}
                />
            ),
            filter: 'between',
        };
    } else if (filter === "multiselect-tokens") {
        return { Filter: (props) => <MultiSelectTokensColumnFilter {...props} dataAuthors={dataAuthors} dataSources={dataSources} dataKeywords={dataKeywords} />, filter: 'includesValue' };
    }
}


// Be sure to pass our updateMyData and the skipReset option
function Table({
                   embeddingType,
                   hasEmbeddings,
                   tableType,
                   scrollToPaperID,
                   setPaperInfo,
                   paperInfo,
                   summarizeBtnShow,
                   setSummarizeBtnShow,
                   literatureReviewBtnShow,
                   setLiteratureReviewBtnShow,
                   summarizePrompt,
                   literatureReviewPrompt,
                   columns,
                   data,
                   tableData,
                   dataFiltered,
                   skipReset,
                   addToSimilarInputPapers,
                   addToSavedPapers,
                   checkoutPapers,
                   summarizePapers,
                   setSummarizePrompt,
                   literatureReviewPapers,
                   setLiteratureReviewPrompt,
                   addToSelectNodeIDs,
                   isInSimilarInputPapers,
                   isInSavedPapers,
                   isInSelectedNodeIDs,
                   deleteRow,
                   initialState,
                   updateVisibleColumns,
                   tableControls,
                   setFilteredPapers,
                   updateColumnFilterValues,
                   updateColumnSortByValues,
                   updateGlobalFilterValue,
                   openGScholar,
                   loadMoreData,
                   hasMoreData,
                   loadAllData,
                   dataAuthors,
                   dataSources,
                   dataKeywords
               }) {

    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingAll, setIsLoadingAll] = useState(false);
    const filterTypes = React.useMemo(
        () => ({
            multiple: (rows, id, filterValue) => {
                return rows.filter(row => {
                    const rowValue = row.values[id];
                    return rowValue !== undefined
                        ? filterValue.includes(rowValue)
                        : true;
                });
            }
        }),
        []
    );

    const defaultColumn = React.useMemo(
        () => ({
            // Let's set up our default Filter UI
            Filter: DefaultColumnFilter,
            // And also our default cell
            Cell: EditableCell,
        }),
        []
    )

    // Use the state and functions returned from useTable to build your UI
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        visibleColumns,
        rows,
        setGlobalFilter,
        toggleHideColumn,
        state: {
            sortBy,
            filters,
            globalFilter
        },
    } = useTable(
        {
            columns,
            data,
            defaultColumn,
            filterTypes,
            initialState: initialState,
            // updateMyData isn't part of the API, but
            // anything we put into these options will
            // automatically be available on the instance.
            // That way we can call this function from our
            // cell renderer!
            scrollToPaperID,
            embeddingType,
            hasEmbeddings,
            tableType,
            addToSimilarInputPapers,
            addToSavedPapers,
            addToSelectNodeIDs,
            checkoutPapers,
            paperInfo,
            setPaperInfo,
            tableControls,
            deleteRow,
            tableData,
            dataFiltered,
            isInSimilarInputPapers,
            isInSavedPapers,
            isInSelectedNodeIDs,
            setFilteredPapers,
            updateVisibleColumns,
            updateColumnFilterValues,
            updateColumnSortByValues,
            updateGlobalFilterValue,
            openGScholar,
            // We also need to pass this so the page doesn't change
            // when we edit the data.
            manualFilters: tableType === "all",
            autoResetHiddenColumns: !skipReset,
            autoResetPage: !skipReset,
            autoResetSelectedRows: !skipReset,
            autoResetGroupBy: !skipReset,
            autoResetSortBy: !skipReset,
            autoResetFilters: !skipReset,
            autoResetRowState: !skipReset,
            disableMultiSort: !skipReset,

        },
        useFilters,
        useGlobalFilter,
        useGroupBy,
        useSortBy,
        useExpanded,
        useRowSelect,
        useFlexLayout,
        useResizeColumns,
        // Here we will use a plugin to add our selection column
        hooks => {
            hooks.visibleColumns.push(columns => {
                let infoColumn = {}, saveColumn = {}, addColumn = {}, deleteColumn = {}, locateColumn = {};
                let afterColumns = [];
                let beforeColumns = [];
                const hostStyles: Partial<ITooltipStyles> = {root: {display: 'inline-block', cursor: 'pointer'}};

                if (tableControls.indexOf("info") !== -1) {
                    infoColumn = {
                        id: 'info',
                        // Make this column a groupByBoundary. This ensures that groupBy columns
                        // are placed after it
                        groupByBoundary: true,
                        Header: () => (
                            <>
                                <span>Info</span><br/>
                                <TooltipHost
                                    delay={TooltipDelay.zero}
                                    content={<span style={{fontSize: 16}}>Get more information.</span>}
                                    id="tooltip-info"
                                    directionalHint={DirectionalHint.rightCenter}
                                    styles={hostStyles}
                                >
                                    <Icon styles={{root: {fontSize: 12}}} iconName="Question"
                                          aria-describedby="tooltip-info"></Icon>
                                </TooltipHost>
                            </>

                        ),
                        // The cell can use the individual row's getToggleRowSelectedProps method
                        // to the render a checkbox
                        Cell: ({row, column, cell}) => (
                            cell.isAggregated ? <></> : <div className="text-center">
                                <IconButton
                                    iconProps={{iconName: "Info"}}
                                    onClick={() => {
                                        setPaperInfo(row.original);
                                        setModalState(true);
                                    }}
                                    className="iconButton"
                                    allowDisabledFocus
                                />
                                {/* <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} /> */}
                            </div>
                        ),
                        width: 15,
                        maxWidth: 15,
                        minWidth: 15
                    }
                    beforeColumns.push(infoColumn);
                }

                if (tableControls.indexOf("locate") !== -1) {
                    locateColumn = {
                        id: 'locate',
                        // Make this column a groupByBoundary. This ensures that groupBy columns
                        // are placed after it
                        groupByBoundary: true,
                        Header: () => (<>
                            <span>Map</span><br/>
                            <TooltipHost
                                delay={TooltipDelay.zero}
                                content={<span style={{fontSize: 16}}>Plot the paper on the UMAP.</span>}
                                id="tooltip-locate"
                                directionalHint={DirectionalHint.leftCenter}
                                styles={hostStyles}
                            >
                                <Icon styles={{root: {fontSize: 12}}} iconName="Question"
                                      aria-describedby="tooltip-locate"></Icon>
                            </TooltipHost>
                        </>),
                        Cell: ({row, column, cell}) => (
                            cell.isAggregated
                                ? <></>
                                : (
                                    hasEmbeddings(row.original["ID"])
                                        ? <div className="text-center">
                                            <IconButton
                                                disabled={isInSelectedNodeIDs(row.original["ID"])}
                                                iconProps={{iconName: "Locate"}}
                                                onClick={() => {
                                                    addToSelectNodeIDs([row.original["ID"]], "table");
                                                }}
                                                className="iconButton"
                                                allowDisabledFocus
                                            />
                                        </div>
                                        : null)
                        ),
                        width: 20,
                        maxWidth: 20,
                        minWidth: 20
                    }
                    afterColumns.push(locateColumn);
                }

                if (tableControls.indexOf("add") !== -1) {
                    addColumn = {
                        id: 'add',
                        // Make this column a groupByBoundary. This ensures that groupBy columns
                        // are placed after it
                        groupByBoundary: true,
                        Header: () => (<>
                            <span>Select</span><br/>
                            <TooltipHost
                                delay={TooltipDelay.zero}
                                content={<span style={{fontSize: 16}}>Select paper and add it to the Similarity Search table.</span>}
                                id="tooltip-select"
                                directionalHint={DirectionalHint.leftCenter}
                                styles={hostStyles}
                            >
                                <Icon styles={{root: {fontSize: 12}}} iconName="Question"
                                      aria-describedby="tooltip-select"></Icon>
                            </TooltipHost>
                        </>),
                        // The cell can use the individual row's getToggleRowSelectedProps method
                        // to the render a checkbox
                        Cell: ({row, column, cell}) => (
                            cell.isAggregated ? <></> : <div className="text-center">
                                <IconButton
                                    iconProps={{iconName: "PlusCircle"}}
                                    disabled={isInSimilarInputPapers(row.original)}
                                    onClick={() => {
                                        addToSimilarInputPapers(row.original);
                                    }}
                                    className="iconButton"
                                    allowDisabledFocus
                                />
                                {/* <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} /> */}
                            </div>
                        ),
                        width: 20,
                        maxWidth: 20,
                        minWidth: 20
                    }
                    afterColumns.push(addColumn);
                }

                if (tableControls.indexOf("save") !== -1) {
                    saveColumn = {
                        id: 'save',
                        // Make this column a groupByBoundary. This ensures that groupBy columns
                        // are placed after it
                        groupByBoundary: true,
                        Header: () => (<>
                            <span>Save</span><br/>
                            <TooltipHost
                                delay={TooltipDelay.zero}
                                content={<span style={{fontSize: 16}}>Save paper to the "cart".</span>}
                                id="tooltip-save"
                                directionalHint={DirectionalHint.leftCenter}
                                styles={hostStyles}
                            >
                                <Icon styles={{root: {fontSize: 12}}} iconName="Question"
                                      aria-describedby="tooltip-save"></Icon>
                            </TooltipHost>
                        </>),
                        Cell: ({row, column, cell}) => (
                            cell.isAggregated ? <></> : <div className="text-center">
                                <IconButton
                                    disabled={isInSavedPapers(row.original)}
                                    iconProps={{iconName: "Save"}}
                                    onClick={() => {
                                        addToSavedPapers(row.original);
                                    }}
                                    className="iconButton"
                                    allowDisabledFocus
                                />
                            </div>
                        ),
                        width: 20,
                        maxWidth: 20,
                        minWidth: 20
                    }
                    afterColumns.push(saveColumn);
                }

                if (tableControls.indexOf("delete") !== -1) {
                    deleteColumn = {
                        id: 'delete',
                        // Make this column a groupByBoundary. This ensures that groupBy columns
                        // are placed after it
                        groupByBoundary: true,
                        // The header can use the table's getToggleAllRowsSelectedProps method
                        // to render a checkbox
                        Header: () => (<>
                            <span>Delete</span><br/>
                            <TooltipHost
                                delay={TooltipDelay.zero}
                                content={<span style={{fontSize: 16}}>Remove/Delete the paper.</span>}
                                id="tooltip-delete"
                                directionalHint={DirectionalHint.leftCenter}
                                styles={hostStyles}
                            >
                                <Icon styles={{root: {fontSize: 12}}} iconName="Question"
                                      aria-describedby="tooltip-delete"></Icon>
                            </TooltipHost>
                        </>),
                        // The cell can use the individual row's getToggleRowSelectedProps method
                        // to the render a checkbox
                        Cell: ({row, column, cell}: any) => (
                            cell.isAggregated ? <></> : <div className="text-center">
                                <IconButton
                                    iconProps={{iconName: "Delete"}}
                                    onClick={() => {
                                        deleteRow(row.index)
                                    }}
                                    className="iconButton"
                                >
                                </IconButton>
                            </div>
                        ),
                        width: 20,
                        maxWidth: 20,
                        minWidth: 20
                    }
                    afterColumns.push(deleteColumn);
                }

                return [
                    ...beforeColumns,
                    ...columns,
                    ...afterColumns
                ]
            })
        }
    )
    // console.log("Rows:", rows);
    if (!Array.isArray(rows)) {
        console.error("Rows are not generated correctly:", rows);
    }

    const isColumn = (id) => {
        return ["save", "add", "delete", "info", "locate"].indexOf(id) === -1
    }

    let options: Array<IDropdownOption> = [];
    let allDisabled: boolean = true;
    columns.forEach((c) => {
        var found = false;
        for (var i = 0; i < visibleColumns.length; i++) {
            if (visibleColumns[i].Header == c.Header) {
                found = true;
                break;
            }
        }
        if (found) {
            options.push({key: c.Header, text: c.Header, disabled: true});
        } else {
            options.push({key: c.Header, text: c.Header, disabled: false});
            allDisabled = false;
        }
    });

    const onChange = (event: React.FormEvent<HTMLDivElement>, item: IDropdownOption): void => {
        toggleHideColumn(item.key);
        updateVisibleColumns(item.key);
    };

    React.useEffect(() => {
        // console.log('updateColumnFilterValues(filters); Triggered');
        // console.log('filters:',filters)
        updateColumnFilterValues(filters);

    }, [filters]);

    React.useEffect(() => {
        // `sortBy` changed
        // console.log('updateColumnSortByValues(sortBy); Triggered');
        // console.log(sortBy);
        updateColumnSortByValues(sortBy);

    }, [sortBy]);

    React.useEffect(() => {
        // `globalFilter` changed
        // console.log('updateGlobalFilterValue(globalFilter); Triggered')
        updateGlobalFilterValue(globalFilter);
    }, [globalFilter]);

    // React.useEffect(() => {
    //     // Apply filters only to currently loaded data
    //     const filteredData = data.filter(row => {
    //         return filters.every(filter => {
    //             // Example: Customize this to match your filter logic
    //             const columnValue = row[filter.id];
    //             if (Array.isArray(filter.value)) {
    //                 return filter.value.includes(columnValue);
    //             }
    //             return columnValue === filter.value;
    //         });
    //     });
    //     setFilteredPapers(filteredData);
    // }, [filters, data]); // Depend only on filters and current data

    // Reference to the VariableSizeList element
    const listRef: any = React.useRef(null);

    React.useEffect(() => {
        // console.log('trigger scrollToPaperID update')
        if (listRef.current && scrollToPaperID != null && scrollToPaperID != undefined) {
            // Then call the scrollToItem() API method with an item index:
            let idx = 0;
            let targetIdx = -1;
            for (idx = 0; idx < rows.length; idx++) {
                if (rows[idx]["original"]["ID"] === scrollToPaperID) {
                    targetIdx = idx;
                    break;
                }
            }
            if (targetIdx != -1) {
                listRef.current.scrollToItem(targetIdx);
            }
        }
    }, [scrollToPaperID]);

    const metaMax = {
        KeywordCount: Math.max.apply(Math, data.map(function (o) {
            return o["KeywordCount"];
        })),
        AuthorCount: Math.max.apply(Math, data.map(function (o) {
            return o["AuthorCount"];
        })),
        YearCount: Math.max.apply(Math, data.map(function (o) {
            return o["YearCount"];
        })),
        SourceCount: Math.max.apply(Math, data.map(function (o) {
            return o["SourceCount"];
        })),
        Count: Math.max.apply(Math, data.map(function (o) {
            return o["Count"];
        }))
    }

    const metaColorScale = {
        KeywordCount: d3.scaleLinear().domain([0, metaMax["KeywordCount"]]).range(["white", "#aaaaaa"] as any),
        AuthorCount: d3.scaleLinear().domain([0, metaMax["AuthorCount"]]).range(["white", "#aaaaaa"] as any),
        YearCount: d3.scaleLinear().domain([0, metaMax["YearCount"]]).range(["white", "#aaaaaa"] as any),
        SourceCount: d3.scaleLinear().domain([0, metaMax["SourceCount"]]).range(["white", "#aaaaaa"] as any),
        Count: d3.scaleLinear().domain([0, metaMax["Count"]]).range(["white", "#aaaaaa"] as any),
        Sim: d3.scaleLinear().domain([0, 1]).range(["white", "#ff7f00"] as any),
    }

    const RenderRow = React.useCallback(
        ({index, style}) => {
            const row = rows[index]
            prepareRow(row);
            // console.log('Rendering Row:', row);

            return (
                <div {...row.getRowProps({style})} className="tr">
                    {row.cells.map(cell => {
                        return (
                            <div {...cell.getCellProps()} className="td">
                                {cell.isGrouped ? (
                                    // If it's a grouped cell, add an expander and row count
                                    <>
                    <span {...row.getToggleRowExpandedProps()}>
                      {row.isExpanded ? '👇' : '👉'}
                    </span>{' '}
                                        {cell.render('Cell', {metaMax: metaMax, metaColorScale: metaColorScale})}
                                    </>
                                ) : cell.isAggregated ? (
                                    // If the cell is aggregated, use the Aggregated
                                    // renderer for cell
                                    // cell.render('Aggregated')
                                    // If the cell is aggregated, use the Aggregated
                                    // renderer for cell
                                    // <span><i>({commaSeparatedSubRowValues(row.subRows, cell.column.id)})</i></span>
                                    <span><i>({row.subRows.length + ' records'})</i></span>
                                ) : cell.isPlaceholder ? null : ( // For cells with repeated values, render null
                                    // Otherwise, just render the regular cell
                                    cell.render('Cell', {metaMax: metaMax, metaColorScale: metaColorScale})
                                )}
                            </div>
                        )
                    })}
                </div>
            )
        },
        [prepareRow, rows]
    )

    // Modal Open/Close
    const [isModalOpen, setModalState] = React.useState(false);

    const onChangeSummarizePrompt = (ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newText: string): void => {
        setSummarizePrompt(newText)
    }

    const onChangeLiteratureReviewPrompt = (ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newText: string): void => {
        setLiteratureReviewPrompt(newText)
    }

    const getHeight = (tableType) => {
        if (tableType == "saved") {
            return 250
        }
        if (tableType == "similar" || tableType == "similarPayload") {
            return 200
        }
        return 325
    }
    const handleLoadMoreData = (event) => {
        event.persist(); // Prevents React from reusing the event object

        setIsLoading(true);
        loadMoreData().then(() => {
            setIsLoading(false);
        }).finally(() => {
            event.target.blur(); // Now safe to use the event object here
        });
    };
    const handleLoadAllData = (event) => {
        event.persist(); // Prevent React from reusing the event object

        setIsLoadingAll(true); // New state for loading all data
        loadAllData().then(() => {
            setIsLoadingAll(false); // Reset the loading state after completion
        }).finally(() => {
            event.target.blur(); // Release event object safely
        });
    };




    // Render the UI for your table
    return (
        <div {...getTableProps()} className="table">

            <Modal
                styles={{main: {maxWidth: 700}}}
                isOpen={isModalOpen}
                onDismiss={() => {
                    setModalState(false)
                }}
                isBlocking={false}
            >
                <div className="p-lg">
                    {paperInfo ?
                        <>
                            <h2 className="p-0 m-0">
                                {paperInfo['Title']}
                                <IconButton
                                    className="float-right iconButton"
                                    iconProps={{iconName: "Times"}}
                                    ariaLabel="Close popup modal"
                                    onClick={() => {
                                        setModalState(false)
                                    }}
                                />
                            </h2>
                            <br/>
                            <div>
                                <b>Authors</b>: {
                                paperInfo['Authors']
                                    ? paperInfo['Authors'].filter(Boolean).join(", ")
                                    : null
                            }<br/>
                                <b>Source</b>: {paperInfo['Source']}<br/>
                                <b>Year</b>: {paperInfo['Year']}<br/>
                                <b>No. of Citations</b>: {paperInfo['CitationCounts']}<br/>
                                <b>ID</b>: {paperInfo['ID']}<br/>
                            </div>
                            <p><b>Abstract</b>: {paperInfo['Abstract']}</p>
                            <div><b>Keywords</b>: {
                                paperInfo['Keywords']
                                    ? paperInfo['Keywords'].filter(Boolean).join(", ")
                                    : null
                            }</div>
                            <br/>
                            <hr></hr>
                            <Stack tokens={{childrenGap: 8}} horizontal>
                                <ActionButton
                                    iconProps={{iconName: "PlusCircle"}}
                                    disabled={isInSimilarInputPapers(paperInfo)}
                                    onClick={() => {
                                        addToSimilarInputPapers(paperInfo);
                                    }}
                                    allowDisabledFocus
                                >Select</ActionButton>
                                <ActionButton
                                    disabled={isInSavedPapers(paperInfo)}
                                    iconProps={{iconName: "Save"}}
                                    onClick={() => {
                                        addToSavedPapers(paperInfo);
                                    }}
                                    allowDisabledFocus
                                >Save</ActionButton>
                                <ActionButton
                                    iconProps={{iconName: "GraduationCap"}}
                                    onClick={() => {
                                        openGScholar(paperInfo["Title"]);
                                    }}
                                    allowDisabledFocus
                                >Google Scholar</ActionButton>
                            </Stack>
                        </>
                        : null
                    }
                </div>
            </Modal>
            <div {...getTableProps()} className="table">
                <div>
                    <div className="tr">
                        <div className="th">
                            <Text variant="mediumPlus">Showing&nbsp;<b>{rows.length}/{data.length}</b>
                            {/*hard coding for speed*/}
                            </Text>
                            &nbsp;&nbsp;
                            <div style={{float: "right"}}>
                                <GlobalFilter
                                    globalFilter={globalFilter}
                                    setGlobalFilter={setGlobalFilter}
                                />
                                {' '}
                                <Dropdown
                                    disabled={allDisabled}
                                    selectedKey={null}
                                    placeholder="Column"
                                    onChange={onChange}
                                    dropdownWidth={120}
                                    options={options}
                                    onRenderCaretDown={() => {
                                        return <Icon className="iconButton" iconName="Plus"></Icon>
                                    }}
                                    styles={{root: {display: "inline-block"}}}
                                />
                                {' '}
                                {tableControls.indexOf("locate") !== -1 ?
                                    <>
                                        <DefaultButton
                                            onClick={() => {
                                                addToSelectNodeIDs(dataFiltered.map((d) => d["ID"]), "table");
                                            }}
                                            iconProps={{iconName: "Locate"}}
                                            text="All"
                                            allowDisabledFocus
                                            styles={{root: {padding: 0, minWidth: 0, display: "inline-block", verticalAlign: "top"}, icon: {color: "#116EBE"}}}
                                        ></DefaultButton>
                                        {' '}
                                    </>
                                    : null}
                                {tableControls.indexOf("add") !== -1 ?
                                    <>
                                        <DefaultButton
                                            text="All"
                                            iconProps={{iconName: "PlusCircle"}}
                                            onClick={() => {
                                                addToSimilarInputPapers(dataFiltered);
                                            }}
                                            allowDisabledFocus
                                            styles={{root: {padding: 0, minWidth: 0, display: "inline-block", verticalAlign: "top"}, icon: {color: "#116EBE"}}}
                                        />
                                        {' '}
                                    </>
                                    : null}
                                {tableControls.indexOf("save") !== -1 ?
                                    <>
                                        <DefaultButton
                                            text="All"
                                            iconProps={{iconName: "Save"}}
                                            onClick={() => {
                                                addToSavedPapers(dataFiltered);
                                            }}
                                            allowDisabledFocus
                                            styles={{root: {padding: 0, minWidth: 0, display: "inline-block", verticalAlign: "top"}, icon: {color: "#116EBE"}}}
                                        />
                                        {' '}
                                    </>
                                    : null}
                                {tableControls.indexOf("delete") !== -1 ?
                                    <>
                                        <DefaultButton
                                            text="All"
                                            iconProps={{iconName: "Delete"}}
                                            onClick={() => {
                                                deleteRow(dataFiltered);
                                            }}
                                            allowDisabledFocus
                                            styles={{root: {padding: 0, minWidth: 0, display: "inline-block", verticalAlign: "top"}, icon: {color: "#116EBE"}}}
                                        />
                                        {' '}
                                    </>
                                    : null}
                                {tableControls.indexOf("summarize") !== -1 ?
                                    <>
                                        <PrimaryButton
                                            id='summarizeBtnId'
                                            onClick={() => setSummarizeBtnShow(!summarizeBtnShow)}
                                            text="Summarize"
                                            allowDisabledFocus
                                            styles={{root: {padding: 0, margin: '0 0.5em', minWidth: 0, display: "inline-block", verticalAlign: "top"}}}
                                        ></PrimaryButton>
                                        {summarizeBtnShow && (
                                            <Callout
                                                style={{padding: '16px 16px', width: 450}}
                                                target={'#summarizeBtnId'}
                                                onDismiss={() => setSummarizeBtnShow(!summarizeBtnShow)}
                                                role="status"
                                                aria-live="assertive"
                                            >
                                                <div>
                                                    <TextField value={summarizePrompt} multiline
                                                               onChange={onChangeSummarizePrompt}/>
                                                    <DefaultButton onClick={() => {
                                                        summarizePapers(summarizePrompt)
                                                    }}> Submit </DefaultButton>
                                                </div>
                                            </Callout>
                                        )}
                                    </>
                                    : null}
                                {tableControls.indexOf("literatureReview") !== -1 ?
                                    <>
                                        <PrimaryButton
                                            id='literatureReviewBtnId'
                                            onClick={() => setLiteratureReviewBtnShow(!literatureReviewBtnShow)}
                                            text="Literature Review"
                                            allowDisabledFocus
                                            styles={{root: {padding: 0, margin: '0 0.5em', minWidth: 0, display: "inline-block", verticalAlign: "top"}}}
                                        ></PrimaryButton>
                                        {literatureReviewBtnShow && (
                                            <Callout
                                                style={{padding: '16px 16px', width: 450}}
                                                target={'#literatureReviewBtnId'}
                                                onDismiss={() => setLiteratureReviewBtnShow(!literatureReviewBtnShow)}
                                                role="status"
                                                aria-live="assertive"
                                            >
                                                <div>
                                                    <TextField value={literatureReviewPrompt} multiline
                                                               onChange={onChangeLiteratureReviewPrompt}/>
                                                    <DefaultButton onClick={() => {
                                                        literatureReviewPapers(literatureReviewPrompt)
                                                    }}> Submit </DefaultButton>
                                                </div>
                                            </Callout>
                                        )}
                                    </>
                                    : null}
                                {tableControls.indexOf("export") !== -1 ?
                                    <>
                                        <PrimaryButton
                                            onClick={checkoutPapers}
                                            iconProps={{iconName: "FileExport"}}
                                            text="Export bib"
                                            allowDisabledFocus
                                            styles={{root: {padding: 0, margin: '0 0 0 0.5em', minWidth: 0, display: "inline-block", verticalAlign: "top"}}}
                                        ></PrimaryButton>
                                    </>
                                    : null}
                            </div>
                        </div>
                    </div>
                    {headerGroups.map(headerGroup => (
                        <div {...headerGroup.getHeaderGroupProps()} className="tr">
                            {headerGroup.headers.map(column => (
                                <div {...column.getHeaderProps()} className="th">
                                    <div>
                      <span {...column.getSortByToggleProps()}>
                        {column.isSorted
                            ? column.isSortedDesc
                                ? <IconButton iconProps={{iconName: "CaretDown"}} className="iconButton"></IconButton>
                                : <IconButton iconProps={{iconName: "CaretUp"}} className="iconButton"></IconButton>
                            : ''
                        }
                          {column.render('Header')}
                          {/* HIDE/SHOW Columns */}
                          {isColumn(column.id)
                              ? <IconButton
                                  iconProps={{iconName: "Minus"}}
                                  onClick={() => {
                                      toggleHideColumn(column.id);
                                      updateVisibleColumns(column.id);
                                  }}
                                  className="iconButton"
                              ></IconButton>
                              : null
                          }
                          {/* Use column.getResizerProps to hook up the events correctly */}
                          {/* Uncomment this to enable COLUMN RESIZING */}
                          <div
                              {...column.getResizerProps()}
                              className={`resizer ${
                                  column.isResizing ? 'isResizing' : ''
                              }`}
                          />
                      </span>
                                    </div>
                                    {/* Render the columns filter UI */}
                                    <div
                                        style={{marginTop: 4}}>{column.canFilter ? column.render('Filter') : null}</div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
                <div {...getTableBodyProps()}>
                    <VariableSizeList
                        ref={listRef}
                        key={"ID"}
                        height={getHeight(tableType)}
                        itemCount={rows.length}
                        itemSize={(index) => 40}
                        itemKey={(index) => index}
                        width={"100%"}
                    >
                        {RenderRow}
                    </VariableSizeList>
                    {hasMoreData && loadMoreData && (
                        <div className="load-more-container">
                            <Button
                                onClick={handleLoadMoreData}
                                disabled={isLoading}
                                className={`load-more-button ${isLoading ? 'loading' : ''}`} /* Apply loading class conditionally */
                            >
                                {isLoading ? 'Loading...' : 'Load More'}
                            </Button>
                            <Button
                                onClick={handleLoadAllData}
                                disabled={isLoadingAll || isLoadingAll} // Disable if either is loading
                                className={`load-all-button ${isLoadingAll ? 'loading' : ''}`}
                            >
                                {isLoadingAll ? 'Loading All...' : 'Load All'}
                            </Button>
                        </div>

                    )}
                </div>
            </div>
        </div>
    )
}

export interface MetaTableProps {
    // State
    staticMinYear?: number;  // Optional properties for min and max years
    staticMaxYear?: number;
    staticMinCitationCounts?:number;
    staticMaxCitationCounts?:number;
    loadMoreData?: () => Promise<void>;
    hasMoreData?: boolean;
    loadAllData?: () => Promise<void>;
    globalFilterValue: Array<any>;
    columnFilterValues: Array<any>;
    columnSortByValues: Array<any>;

    // State-changing functions
    updateColumnFilterValues: Function;
    updateGlobalFilterValue: Function;
    updateColumnSortByValues: Function;
    setFilteredPapers: Function;
    scrollToPaperID?: number;

    tableControls: Array<string>;
    columnIds: Array<string>;
    columnsVisible: Array<string>;
    columnWidths: {};
    columnFilterTypes: {};
    tableData: {
        all: any[],
        saved: any[],
        similarPayload: any[],
        similar: any[],
        keyword: any[],
        author: any[],
        source: any[],
        year: any[],
    };
    dataFiltered: any[];
    tableType: string;
    addToSimilarInputPapers?: Function;
    addToSavedPapers?: Function;
    addToSelectNodeIDs?: Function;
    deleteRow?: Function;
    isInSimilarInputPapers?: Function;
    isInSavedPapers?: Function;
    updateVisibleColumns: Function;
    checkoutPapers?: Function;
    summarizePapers?: Function;
    literatureReviewPapers?: Function;
    embeddingType: string;
    hasEmbeddings: Function;
    openGScholar?: Function;
    isInSelectedNodeIDs?: Function;
    dataAuthors?: any[];
    dataSources?: any[];
    dataKeywords?: any[];
    applyLocalFilters?: Function;
    authorsSummary?: Array<{ _id: string; count: number }>;
    sourcesSummary?: Array<{ _id: string; count: number }>;
    keywordsSummary?: Array<{ _id: string; count: number }>;
    yearsSummary?: Array<{ _id: number; count: number }>;
}

export const MetaTable: React.FC<{
    props: MetaTableProps
}> = observer(({props}) => {
    let {
        tableData, dataFiltered=[], tableType, tableControls, columnIds, isInSimilarInputPapers,
        isInSavedPapers, addToSimilarInputPapers, addToSavedPapers, deleteRow, columnWidths,
        columnFilterTypes, updateVisibleColumns, columnsVisible, updateColumnFilterValues,
        columnFilterValues, setFilteredPapers, updateColumnSortByValues, columnSortByValues,
        globalFilterValue, updateGlobalFilterValue, scrollToPaperID, addToSelectNodeIDs,
        checkoutPapers, summarizePapers, literatureReviewPapers, embeddingType, hasEmbeddings, openGScholar,
        isInSelectedNodeIDs, loadMoreData, hasMoreData, loadAllData, dataAuthors, dataSources,
        dataKeywords, staticMinYear,staticMaxYear,staticMinCitationCounts,staticMaxCitationCounts, applyLocalFilters
    } = props;
    // console.log('columnFilterTypes:',columnFilterTypes)
    const minYearRef = useRef(staticMinYear);
    const maxYearRef = useRef(staticMaxYear);
    const minCitationCountRef = useRef(staticMinCitationCounts);
    const maxCitationCountRef = useRef(staticMaxCitationCounts);

    const [minYear, setMinYear] = useState(minYearRef.current ?? null);
    const [maxYear, setMaxYear] = useState(maxYearRef.current ?? null);
    const [minCitationCount, setMinCitationCount] = useState(minCitationCountRef.current ?? null);
    const [maxCitationCount, setMaxCitationCount] = useState(maxCitationCountRef.current ?? null);

    if (minYearRef.current !== undefined) setMinYear(minYearRef.current);
    if (maxYearRef.current !== undefined) setMaxYear(maxYearRef.current);
    if (minCitationCountRef.current !== undefined) setMinCitationCount(minCitationCountRef.current);
    if (maxCitationCountRef.current !== undefined) setMaxCitationCount(maxCitationCountRef.current);

    // console.log("minYear:", minYear, "maxYear:", maxYear);
    // console.log("minCitationCount:", minCitationCount, "maxCitationCount:", maxCitationCount);

    const [filteredLocalData, setFilteredLocalData] = useState([]);
    // console.log("tableType:",tableType);
    console.log(tableData.all);
    // const isMetadata = tableType === "keyword" && Array.isArray(tableData.all) && tableData.all[0]?.Keyword;
    let data;
    data = tableData.all;
    // console.log("Data for table:", data);
    if (!Array.isArray(data)) {
        console.error("Data is not an array or is undefined:", data);
    }

    const columns = React.useMemo(() => columnIds.map((c) => {
        // console.log("Column ID:", c);
        // console.log("Column Widths:", columnWidths[c]);
        // console.log("Column Filter Type:", columnFilterTypes[c]);
        const columnHeader = {Header: c, accessor: c};
        const columnWidth = columnWidths[c];
        const columnData = tableData.all.map(row => row[c]);
        // console.log('columnFilterTypes passed dataSources',dataSources);
        const columnFilter = filterMapping(
            columnFilterTypes[c],
            dataAuthors,
            dataSources,
            dataKeywords,
            c,  // Pass column ID here
            staticMinYear,
            staticMaxYear,
            staticMinCitationCounts,
            staticMaxCitationCounts,
            columnData
        );

        // console.log("Columns for Table:", columns);


        return { ...columnHeader, ...columnWidth, ...columnFilter };
    }), [
        columnIds,
        columnWidths,
        columnFilterTypes,
        staticMinYear,
        staticMaxYear,
        staticMinCitationCounts,
        staticMaxCitationCounts
    ]);
    // console.log("Columns:", columns);

    // We need to keep the table from resetting the pageIndex when we
    // Update data. So we can keep track of that flag with a ref.
    const skipResetRef = React.useRef(false);

    // After data changes, we turn the flag back off
    // so that if data actually changes when we're not
    // editing it, the page is reset
    React.useEffect(() => {
        // console.log('trgger data update')
        skipResetRef.current = false
    }, [data]);

    const initialState: any = {
        hiddenColumns: columnIds.filter(x => !columnsVisible.includes(x)),
        sortBy: columnSortByValues?columnSortByValues:[],
        filters: columnFilterValues,
        globalFilter: globalFilterValue,
    };

    const [paperInfo, setPaperInfo] = React.useState(null);
    const [summarizeBtnShow, setSummarizeBtnShow] = React.useState(false);
    const [literatureReviewBtnShow, setLiteratureReviewBtnShow] = React.useState(false);

    const [summarizePrompt, setSummarizePrompt] = React.useState(`You are a scholar expert in the field of data visualization. \
    Now, I'm giving you relevant information about some papers. \
    Could you please help me summarize the content of this paper? \
    The requirement is to provide a detailed summary and also to expand upon it as appropriate.`);
    const [literatureReviewPrompt, setLiteratureReviewPrompt] = React.useState(`You are an expert scholar in the field of data visualization. \
    Now, I'm giving you information on some relevant papers. \
    Could you please help me write a comprehensive literature review about these papers? \
    The requirement is to compare these papers as much as possible, summarizing the similarities, differences, and connections between them.`);

    // @ts-ignore
    return (
        <Styles>
            <Table
                tableType={tableType}
                embeddingType={embeddingType}
                hasEmbeddings={hasEmbeddings}
                scrollToPaperID={scrollToPaperID}
                paperInfo={paperInfo}
                setPaperInfo={setPaperInfo}
                summarizeBtnShow={summarizeBtnShow}
                setSummarizeBtnShow={setSummarizeBtnShow}
                literatureReviewBtnShow={literatureReviewBtnShow}
                setLiteratureReviewBtnShow={setLiteratureReviewBtnShow}
                summarizePrompt={summarizePrompt}
                setSummarizePrompt={setSummarizePrompt}
                literatureReviewPrompt={literatureReviewPrompt}
                setLiteratureReviewPrompt={setLiteratureReviewPrompt}
                columns={columns}
                data={data}
                tableControls={tableControls}
                tableData={tableData}
                addToSelectNodeIDs={addToSelectNodeIDs}
                addToSimilarInputPapers={addToSimilarInputPapers}
                addToSavedPapers={addToSavedPapers}
                deleteRow={deleteRow}
                isInSimilarInputPapers={isInSimilarInputPapers}
                isInSavedPapers={isInSavedPapers}
                isInSelectedNodeIDs={isInSelectedNodeIDs}
                skipReset={skipResetRef.current}
                initialState={initialState}
                updateVisibleColumns={updateVisibleColumns}
                updateColumnFilterValues={updateColumnFilterValues}
                updateColumnSortByValues={updateColumnSortByValues}
                updateGlobalFilterValue={updateGlobalFilterValue}
                setFilteredPapers={setFilteredPapers}
                dataFiltered={dataFiltered}
                checkoutPapers={checkoutPapers}
                summarizePapers={summarizePapers}
                literatureReviewPapers={literatureReviewPapers}
                openGScholar={openGScholar}
                loadMoreData={loadMoreData}
                hasMoreData={hasMoreData}
                loadAllData={loadAllData}
                dataAuthors={dataAuthors}  // Pass dataAuthors to Table
                dataSources={dataSources}  // Pass dataSources to Table
                dataKeywords={dataKeywords}></Table>
        </Styles>
    )
});


export default MetaTable

