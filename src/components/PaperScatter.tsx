/* eslint no-console: 0 */
import "./../assets/scss/PaperScatter.scss";

import * as React from "react";
import createScatterplot from 'regl-scatterplot';
import { axisBottom, axisLeft } from 'd3-axis';
import { scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import { observer } from "mobx-react";
import { ActionButton, DefaultButton, Dropdown, Icon, IconButton, IDropdownOption, Label, Modal, Panel, PanelType, Stack } from "@fluentui/react";

interface AppProps {
    setScrollToPaperID: Function;
    data: Array<any>;
    dataFiltered: Array<any>;
    dataSimilarPayload: Array<any>;
    dataSimilar: Array<any>;
    dataSaved: Array<any>;
    isInSimilarInputPapers: Function;
    isInSavedPapers: Function;
    addToSavedPapers: Function;
    isInFilteredPapers: Function;
    addToSimilarInputPapers: Function;
    isInSimilarPapers: Function;
    selectNodeIDs: Array<any>;
    addToSelectNodeIDs: Function;
    embeddingType: string;
    openGScholar: Function;
    eventOrigin: string;
}

let scatterplot;
let datapoints = [];
let [xMin, xMax] = [{
    "specter_umap": 1000,
    "glove_umap": 1000
},{
    "specter_umap": -1000,
    "glove_umap": -1000
}]
let [yMin, yMax] = [{
    "specter_umap": 1000,
    "glove_umap": 1000
},{
    "specter_umap": -1000,
    "glove_umap": -1000
}]

const hoverColor = "#bbdefb";
const colorListTableTypes = ['#555555','#eeeeee','#e31a1c','#ff5aac','#ff7f00'];
const colorListCategoricalType = ['#a6cee3', '#222222','#e31a1c','#ff7f00','#1f78b4','#dddddd', '#b2df8a','#33a02c','#fb9a99','#fdbf6f','#cab2d6','#6a3d9a','#ffff99','#b15928'];
const colorListNumericalType = ['#fc8d59', '#91cf60'];

const colorByDropdownOptions = [
    { key: "Default", text: "Default" },
    { key: "Source", text: "Source" },
    { key: "Year", text: "Year" },
    // { key: "CitationCounts", text: "CitationCounts" }
    // { key: "Similarity", text: "Similarity" }
];

let papersToShow = [];
let axisContainer, xAxisContainer, yAxisContainer;
let xScale:any, yScale: any;
let selectNodes = [];

export const PaperScatter: React.FC<{props: AppProps}> = observer(({props}) => {
    const {data, dataFiltered, dataSimilarPayload, dataSaved, dataSimilar, isInSimilarInputPapers, isInSimilarPapers, isInSavedPapers, addToSavedPapers, addToSimilarInputPapers, selectNodeIDs, addToSelectNodeIDs, isInFilteredPapers, setScrollToPaperID, embeddingType, openGScholar, eventOrigin} = props;
    const [hoverNode, setHoverNode] = React.useState(null);
    const [categoryColorMap, setCategoryColorMap] = React.useState(null);
    const [isFirstTime, setFirstTime] = React.useState(false);
    const [isColorLegendPanelOpen, setIsColorLegendPanelOpen] = React.useState(false);
    const [colorByAttribute, setColorByAttribute] = React.useState<IDropdownOption>(colorByDropdownOptions[0]);
    const embeddingKey = embeddingType + "_umap";

    React.useEffect(() => {
        papersToShow = [...data];
        if(!isFirstTime){
            load();
            setFirstTime(true);
        }
        update();
        updateSelections();
    }, [data, dataFiltered, dataSaved, dataSimilarPayload, dataSimilar, selectNodeIDs]);

    const reset = () => {
        scatterplot.reset();
    }

    const updateSelections = () => {
        let _selectNodes = [];
        let _selectNodeIdx = [];
        let _embeddingX = 0;
        let _embeddingY = 0;
        let _validEmbeddings = 0;
        papersToShow.forEach((paper, ix) => {
            if(selectNodeIDs.indexOf(paper["ID"]) !== -1){
                _selectNodes.push(paper);
                _selectNodeIdx.push(ix);

                try{
                    if(embeddingKey in paper){
                        if(!isNaN(paper[embeddingKey][0]) && !isNaN(paper[embeddingKey][1])){
                            _embeddingX += paper[embeddingKey][0];
                            _embeddingY += paper[embeddingKey][1];
                            _validEmbeddings += 1;
                        }    
                    }    
                }catch(err){

                }
            }
        });

        selectNodes = [..._selectNodes];
        scatterplot.deselect({preventEvent: true});
        scatterplot.select(_selectNodeIdx, {preventEvent: true});
        
        console.log(eventOrigin);
        if(selectNodes.length > 0 && eventOrigin != "scatterplot"){
            scatterplot.set({
                cameraDistance: 10,
                cameraTarget: [_embeddingX/_validEmbeddings, _embeddingY/_validEmbeddings]
            });
        }
    }

    const pointoverHandler = (pointIdx) => {
        setHoverNode(papersToShow[pointIdx]);
        setScrollToPaperID(papersToShow[pointIdx]["ID"]);
    };

    const pointoutHandler = (pointIdx) => {
        setHoverNode(null);
        setScrollToPaperID(null);
    };

    const selectHandler = ({ points: selectedPoints }) => {
        addToSelectNodeIDs(selectedPoints.map((idx) => {
            return papersToShow[idx]["ID"];
        }), "scatterplot");
    };

    const deselectHandler = () => {
        addToSelectNodeIDs([], "scatterplot");
    };

    const load = () => {
        const parentWrapper = document.querySelector('#parent-wrapper');
        const canvas = document.querySelector('#canvas');
        
        axisContainer = select(parentWrapper).insert('svg', '#canvas');
        xAxisContainer = axisContainer.append('g').attr("class", "axis xAxis");
        yAxisContainer = axisContainer.append('g').attr("class", "axis yAxis");

        axisContainer.node().style.position = 'absolute';
        axisContainer.node().style.top = "0px";
        axisContainer.node().style.left = "0px";
        axisContainer.node().style.width = '100%';
        axisContainer.node().style.height = '100%';
        axisContainer.node().style.pointerEvents = 'none';

        const resizeHandler = () => {
            const { width, height } = canvas.getBoundingClientRect();
            scatterplot.set({ width, height });
        };
        window.addEventListener('resize', resizeHandler);
        
        // Find the RANGE of chart to the raw dataset so that NO RESIZING occurs when FILTERED.
        for(var i=0; i < data.length; i++){
            if(data[i][embeddingKey]){
                if(data[i][embeddingKey][0] > xMax[embeddingKey]){
                    xMax[embeddingKey] = data[i][embeddingKey][0];
                }
                if(data[i][embeddingKey][0] < xMin[embeddingKey]){
                    xMin[embeddingKey] = data[i][embeddingKey][0];
                }
                if(data[i][embeddingKey][1] > yMax[embeddingKey]){
                    yMax[embeddingKey] = data[i][embeddingKey][1];
                }
                if(data[i][embeddingKey][1] < yMin[embeddingKey]){
                    yMin[embeddingKey] = data[i][embeddingKey][1];
                }
            }
        }

        // Find width / height
        const { width, height } = canvas.getBoundingClientRect();        

        // Update the scale domain and range
        xScale = scaleLinear().domain([xMin[embeddingKey], xMax[embeddingKey]]);
        yScale = scaleLinear().domain([yMin[embeddingKey], yMax[embeddingKey]]);

        // Define D3 Axes
        const xAxis = axisBottom(xScale).tickFormat((domain, number)=>{return ""});
        const yAxis = axisLeft(yScale).tickFormat((domain, number)=>{return ""});

        // Render grid
        // xAxis.tickSizeInner(-height);
        // yAxis.tickSizeInner(-width);

        // Call Axis
        xAxisContainer
            .attr('transform', `translate(0, ${height})`)
            .style('stroke', '#777')
            .call(xAxis);

        yAxisContainer
            .attr('transform', `translate(0, 0)`)
            .style('stroke', '#777')
            .call(yAxis);
            
        
        // Create Scatterplot instance
        scatterplot = createScatterplot({
            canvas,
            width,
            height,
            xScale,
            yScale,
            cameraTarget: [(xMin[embeddingKey]+xMax[embeddingKey])/2, (yMin[embeddingKey]+yMax[embeddingKey])/2],
            cameraDistance: 10,
            pointSize: 12,
            showRecticle: true,            
            recticleColor: '#000000',
            deselectOnDblClick: false,
            deselectOnEscape: false,
            pointSizeSelected: 4, 
            opacity: 1,
            pointOutlineWidth: 4
        });

        // Subscribe to events
        scatterplot.subscribe('select', selectHandler);
        scatterplot.subscribe('deselect', deselectHandler);
        scatterplot.subscribe('pointover', pointoverHandler);
        scatterplot.subscribe('pointout', pointoutHandler);
        scatterplot.subscribe('view', ({xScale, yScale, camera, view}) => {
            xAxisContainer.call(xAxis.scale(xScale));
            yAxisContainer.call(yAxis.scale(yScale));
        });

        // Update the xAxis, yAxis with initial scale
        xAxisContainer.call(xAxis.scale(xScale));
        yAxisContainer.call(yAxis.scale(yScale));
    }

    const update = () => {

        // Re-FILL the datapoints
        datapoints = [];

        // Reset the Category Color Map 
        setCategoryColorMap({});

        let colorByMap = {};
        let colorValueIndex = 0;

        let categoryAttributeValue = null;
        let valueAttributeValue = null;

        let maxAttrVal = -1;
        for(var i=0; i < papersToShow.length; i++){
            const currAttrVal = papersToShow[i][colorByAttribute.key];
            if(currAttrVal > maxAttrVal){
                maxAttrVal = currAttrVal;
            }
        }

        for(var i=0; i < papersToShow.length; i++){
            if(["Default"].indexOf(colorByAttribute.key as string) !== -1){
                let colorByValue = null;
                if(!isInFilteredPapers(papersToShow[i])){
                    colorByValue = "Filtered";
                    if(!(colorByValue in colorByMap)){
                        colorByMap[colorByValue] = [colorValueIndex++, colorListTableTypes[1]];
                    }
                }else if(isInSavedPapers(papersToShow[i])){
                    colorByValue = "Saved";
                    if(!(colorByValue in colorByMap)){
                        colorByMap[colorByValue] = [colorValueIndex++, colorListTableTypes[2]];
                    }
                }else if(isInSimilarInputPapers(papersToShow[i])){
                    colorByValue = "Similarity Input";
                    if(!(colorByValue in colorByMap)){
                        colorByMap[colorByValue] = [colorValueIndex++, colorListTableTypes[3]];
                    }
                }else if(isInSimilarPapers(papersToShow[i])){
                    colorByValue = "Similarity Output";
                    if(!(colorByValue in colorByMap)){
                        colorByMap[colorByValue] = [colorValueIndex++, colorListTableTypes[4]];
                    }
                }else{
                    colorByValue = "Unfiltered";
                    if(!(colorByValue in colorByMap)){
                        colorByMap[colorByValue] = [colorValueIndex++, colorListTableTypes[0]];
                    }
                }
                categoryAttributeValue = colorByMap[colorByValue][0];
                valueAttributeValue = null;
            }else{
                const colorByValue = papersToShow[i][colorByAttribute.key];
                if(!(colorByValue in colorByMap)){
                    colorByMap[colorByValue] = colorValueIndex++
                }
                if(["Similarity", "CitationCounts"].indexOf(colorByAttribute.key as string) !== -1){
                    valueAttributeValue = colorByMap[colorByValue];
                    categoryAttributeValue = null;
                }else{
                    categoryAttributeValue = colorByMap[colorByValue];
                    valueAttributeValue = null;
                }
            }

            let datapoint = [];
            let x, y;
            if(embeddingKey == "glove_umap"){
                if("glove_umap" in papersToShow[i] && papersToShow[i]["glove_umap"] != null){
                    x = papersToShow[i]["glove_umap"][0];
                    y = papersToShow[i]["glove_umap"][1];
                }else{
                    // Put them to the origin, what else!
                    x = 0;
                    y = 0;
                }
            }else if(embeddingKey == "specter_umap"){
                if("specter_umap" in papersToShow[i] && papersToShow[i]["specter_umap"] != null){
                    x = papersToShow[i]["specter_umap"][0];
                    y = papersToShow[i]["specter_umap"][1];
                }else{
                    // Put them to the origin, what else!
                    x = 0;
                    y = 0;
                }
            }
            datapoint = [
                x,
                y,
                categoryAttributeValue,
                valueAttributeValue
            ];
            datapoints.push(datapoint);
    }

        if(["Similarity", "CitationCounts"].indexOf(colorByAttribute.key as string) !== -1){
            const _colorMap = {
                0: colorListNumericalType[0],
                1: colorListNumericalType[1]
            };
            scatterplot.set({
                colorBy: 'value',
                pointColorActive: Object.values(_colorMap),
                pointColorHover: [hoverColor, hoverColor],
                pointColor: Object.values(_colorMap)
            });
            setCategoryColorMap(_colorMap);
        }else if(["Default"].indexOf(colorByAttribute.key as string) !== -1){
            const _activeColors = [];
            const _hoverColors = [];
            let _colorMap = {};
            Object.keys(colorByMap).forEach((cat) => {
                _colorMap[cat] = colorByMap[cat][1];
                _activeColors.push(colorByMap[cat][1]);
                _hoverColors.push(hoverColor);
            });

            scatterplot.set({
                colorBy: 'category',
                pointColorActive: _activeColors,
                pointColorHover: _hoverColors,
                pointColor: _activeColors
            });
            setCategoryColorMap(_colorMap);
        }else{
            let _colorMap = {};
            const _hoverColors = [];
            Object.keys(colorByMap).forEach((cat) => {
                _colorMap[cat] = colorListCategoricalType[colorByMap[cat] % colorListCategoricalType.length];
                _hoverColors.push(hoverColor);
            });
            scatterplot.set({
                colorBy: 'category',
                pointColorActive: Object.values(_colorMap),
                pointColorHover: _hoverColors,
                pointColor: Object.values(_colorMap)
            });
            setCategoryColorMap(_colorMap);
        }

        // Update the Axes
        xAxisContainer.call(scatterplot.get('xScale'));
        yAxisContainer.call(scatterplot.get('yScale'));

        // Draw the datapoints
        scatterplot.draw(datapoints, {transition: true});
    }

    // Update layout when any Direct Manipulation control changes.
    React.useEffect(() => {
        update();        
    }, [colorByAttribute, embeddingKey]);

    const onChangeColorByAttribute = (event: React.FormEvent<HTMLDivElement>, item: IDropdownOption): void => {
        setColorByAttribute(item);
    };

    // Modal Open/Close
    const [isModalOpen, setModalState] = React.useState(false);

    return <div>
                <Stack horizontal horizontalAlign="space-between" verticalAlign="center" tokens={{childrenGap: 8}}>
                    <Label style={{fontSize: "1.2rem"}}>Visualization</Label>
                    <div className="float-right">
                        <Stack horizontal verticalAlign="center" tokens={{childrenGap: 8}}>
                            <Stack horizontal verticalAlign="center">
                                <Label>Color</Label>
                                <Panel
                                    headerText="Legend"
                                    isOpen={isColorLegendPanelOpen}
                                    onDismiss={() => setIsColorLegendPanelOpen(false)}
                                    type={PanelType.smallFixedFar}
                                    isBlocking={false}
                                    closeButtonAriaLabel="Close"
                                >
                                    <ul style={{ margin: 10, padding: 0 }}>
                                        {categoryColorMap ?
                                            Object.keys(categoryColorMap).map(cat => {
                                                return <li key={cat}>
                                                    <div style={{
                                                        display: "inline-block", 
                                                        border: "1px solid black",
                                                        background: categoryColorMap[cat], 
                                                        width: 10, 
                                                        height: 10}}>
                                                    </div>&nbsp;&nbsp;{cat}
                                                </li>
                                            })
                                        : null
                                        }
                                    </ul>
                                </Panel>
                            </Stack>
                            <Dropdown
                                // label="Color by"
                                selectedKey={colorByAttribute.key}
                                // eslint-disable-next-line react/jsx-no-bind
                                onChange={onChangeColorByAttribute}
                                placeholder="Select an option"
                                options={colorByDropdownOptions}
                                styles={{root: {display: "inline-block"}}}
                            />
                        </Stack>
                    </div>
                </Stack>
                <div className="m-t-md"></div>
                <Stack horizontal verticalAlign="center" tokens={{childrenGap:8}}>
                    <div>
                        <Icon iconName="Mouse"></Icon>&nbsp;
                        <span>Click on a point to (de)select</span>
                    </div>
                    <div>|</div>
                    {/* <div>
                        <Icon iconName="Mouse"></Icon>&nbsp;
                        <span>DblClick to deselect all</span>
                    </div>
                    <div>|</div> */}
                    <div>
                        <Icon iconName="Keyboard"></Icon>&nbsp;
                        <span>&lt;Shift&gt; to </span>&nbsp;
                        <Icon iconName="PenWorkspace"></Icon>&nbsp;&nbsp;
                        <span>lasso (de)select points</span>
                    </div>
                </Stack>
                <Stack horizontal verticalAlign="center" tokens={{childrenGap:8}}>
                    {/* <Icon iconName="Key"></Icon>&nbsp; */}
                    {colorByAttribute.key == "Default"
                    ? <>
                        <ul className="horizontalList">
                            {categoryColorMap ?
                                Object.keys(categoryColorMap).map(cat => {
                                    return <li key={cat}>
                                        <div style={{
                                            display: "inline-block", 
                                            border: "1px solid black",
                                            borderRadius: 10,
                                            background: categoryColorMap[cat], 
                                            width: 10, 
                                            height: 10}}>
                                        </div>&nbsp;&nbsp;{cat}
                                    </li>
                                })
                            : null
                            }
                        </ul>
                    </>
                    : <>
                        <ul className="horizontalList showOnlyThreeLi">
                            {categoryColorMap ?
                                Object.keys(categoryColorMap).map(cat => {
                                    return <li key={cat}>
                                        <div style={{
                                            display: "inline-block", 
                                            border: "1px solid black",
                                            borderRadius: 10,
                                            background: categoryColorMap[cat], 
                                            width: 10, 
                                            height: 10}}>
                                        </div>&nbsp;&nbsp;{cat}
                                    </li>
                                })
                            : null
                            }
                        </ul>
                        &nbsp;
                        <a href="javascript:void(0)" onClick={() => setIsColorLegendPanelOpen(true)}>see all</a>
                    </>
                    }                    
                </Stack>
                <div className="m-t-md"></div>
                <Stack tokens={{childrenGap: 8}}>
                    <div>
                        <div id="parent-wrapper">
                            <canvas id="canvas"></canvas>
                            <DefaultButton 
                                className="iconButton"
                                onClick={(e) => { reset(); }}
                                iconProps={{iconName:"Location"}}
                                text="Recenter"
                                style={{position:"absolute", right: 0, bottom: 54, border: 0, padding: 0, minWidth: 0}}
                            />
                            <DefaultButton 
                                className="iconButton"
                                onClick={(e) => { scatterplot.deselect({preventDefault: true}); }}
                                iconProps={{iconName:"Times"}}
                                text="Clear"
                                style={{position:"absolute", right: 0, top: 0, border: 0, padding: 0, minWidth: 0}}
                            />
                            <div id="detailTooltip">
                                <table>
                                    <colgroup>
                                        <col style={{ width: 60 }} />
                                        <col style={{ width: "calc(100% - 150)" }} />
                                        <col style={{ width: 90 }} />
                                    </colgroup>
                                    <tbody>
                                        <tr>
                                            <td><div>Hover:</div></td>
                                            <td>
                                                { hoverNode && "Title" in hoverNode
                                                ? <div>{hoverNode["Title"]}</div>
                                                : null
                                                }
                                            </td>
                                            <td></td>
                                        </tr>
                                        <tr>
                                            <td><div>Click:</div></td>
                                            <td>
                                                {
                                                selectNodes.length > 0
                                                ? <>
                                                    { selectNodes.length == 1 && "Title" in selectNodes[0]
                                                    ? <div>{selectNodes[0]["Title"]}</div>
                                                    : <div>{selectNodes.length} papers selected</div>
                                                    }
                                                </>
                                                : null
                                                }
                                            </td>
                                            <td>
                                                {
                                                selectNodes.length > 0
                                                ? <div><Stack horizontalAlign="center" horizontal verticalAlign="center" tokens={{childrenGap: 0}}>
                                                    <IconButton 
                                                        styles={{root: {height: "auto", padding: 0}}}
                                                        iconProps={{iconName: "Info"}}
                                                        onClick={() => { setModalState(true);}} 
                                                        allowDisabledFocus 
                                                    ></IconButton>
                                                    <IconButton 
                                                        styles={{root: {height: "auto", padding: 0}}}
                                                        iconProps={{iconName: "PlusCircle"}}
                                                        disabled={ isInSimilarInputPapers(selectNodes) }
                                                        onClick={() => addToSimilarInputPapers(selectNodes)} 
                                                        allowDisabledFocus 
                                                    ></IconButton>
                                                    <IconButton 
                                                        styles={{root: {height: "auto", padding: 0}}}
                                                        iconProps={{iconName: "Save"}}
                                                        disabled={ isInSavedPapers(selectNodes) }
                                                        onClick={() => addToSavedPapers(selectNodes)} 
                                                        allowDisabledFocus 
                                                    ></IconButton>
                                                    </Stack></div>
                                                : null }
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </Stack>
                <Modal
                    styles={{main: {maxWidth: 700}}}
                    isOpen={isModalOpen}
                    onDismiss={() => {setModalState(false)}}
                    isBlocking={false}
                >
                    <div className="p-lg">
                        {selectNodes.map((selectNode, idx) => {
                            if(selectNode && "Title" in selectNode){
                                return <div key={selectNode['Title']}>
                                    <h2 className="p-0 m-0">
                                        {selectNode['Title']}
                                        <IconButton
                                            className="float-right"
                                            iconProps={{iconName: "Times"}}
                                            ariaLabel="Close popup modal"
                                            onClick={() => {setModalState(false)}}
                                        />
                                    </h2>
                                    <br/>
                                    <div>
                                        <b>Authors</b>: {
                                        selectNode['Authors'] 
                                        ? selectNode['Authors'].filter(Boolean).join(", ")
                                        : null
                                        }<br/>
                                        <b>Source</b>: {selectNode['Source']}<br/>
                                        <b>Year</b>: {selectNode['Year']}<br/>
                                        <b>No. of Citations</b>: {selectNode['CitationCounts']}<br/>
                                        <b>ID</b>: {selectNode['ID']}<br/>
                                    </div>
                                    <p><b>Abstract</b>: {selectNode['Abstract']}</p>
                                    <div><b>Keywords</b>: {
                                        selectNode['Keywords'] 
                                        ? selectNode['Keywords'].filter(Boolean).join(", ")
                                        : null
                                    }</div>
                                    <br/>
                                    <hr></hr>
                                    <Stack tokens={{ childrenGap: 8 }} horizontal>
                                        <ActionButton 
                                            iconProps={{iconName: "PlusCircle"}}
                                            disabled={isInSimilarInputPapers(selectNode)}
                                            onClick={() => {addToSimilarInputPapers(selectNode);}} 
                                            allowDisabledFocus 
                                            >Select</ActionButton>
                                        <ActionButton 
                                            disabled={ isInSavedPapers(selectNode) }
                                            iconProps={{iconName: "Save"}}
                                            onClick={() => { addToSavedPapers(selectNode); }} 
                                            allowDisabledFocus 
                                        >Save</ActionButton>
                                        <ActionButton 
                                            iconProps={{iconName: "GraduationCap"}}
                                            onClick={() => { openGScholar(selectNode["Title"]) }} 
                                            allowDisabledFocus 
                                        >Google Scholar</ActionButton>
                                    </Stack>
                                    {
                                        selectNodes.length - 1 != idx
                                        ? <>
                                            <div className="m-t-sm"></div>
                                            <div style={{height: 5, background: "black", width: "100%"}}></div>
                                        </>
                                        : null                                                                                
                                    }
                                    <br/>
                                </div>
                            }else{
                                return null;
                            }
                        })} 
                    </div>
                </Modal>
            </div>
});

export default PaperScatter;