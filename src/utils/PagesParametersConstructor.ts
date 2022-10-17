import Pages from "../Pages";
import { CoordinateInPixels, Orientation } from "./Types";

export function generateParamsSimulatorToView(pages:Pages):ParamsSimulatorToView{
    const params:ParamsSimulatorToView = {
        sizePages:pages.sizePageinPixels,
        orientation:pages.orientation,
        pages:[]
    } 

    const diccionarioFlujos = {}
    pages.flows.forEach((flow,flow_idx)=>{
        flow.position.fragments.forEach((fragmentOfFlow,fragmentOfFlow_idx)=>{
            if(!(fragmentOfFlow.page in params.pages)){
                params.pages.push({
                    flowFragments:[],
                    elementsFragments:[]
                })
            }

            params.pages[fragmentOfFlow.page].flowFragments.push({
                id:flow.id,
                indexInFlow:fragmentOfFlow_idx,
                indexInPage:flow.position.positionInPage,
                startCoordinate:fragmentOfFlow.startCoordinate,
                size:[fragmentOfFlow.width,fragmentOfFlow.height],
                elementFragments:[]
            })


        })

        flow.elements.forEach(element=>{
            element.position.fragments.forEach((fragmentOfElement,fragmentOfElement_idx)=>{
                params.pages[fragmentOfElement.page].elementsFragments.push({
                    id:element.id,
                    flowId:flow.id,
                    indexInElement:fragmentOfElement_idx,
                    indexInFlow:element.position.positionInFlow,
                    flowColumn:fragmentOfElement.flowColumn,
                    startCoordinate:fragmentOfElement.startCoordinate,
                    size:[fragmentOfElement.width,fragmentOfElement.height],
                    type:element.type,
                    optionsToRender: element.getOptionsToRenderByFragment(fragmentOfElement_idx)
                })
            })
        })
    })


    
    return params
}

export interface ParamsSimulatorToView{
    sizePages: SizeInPixels;
    pages: Page[];
    orientation:Orientation;
}

export type SizeInPixels = [width:number,height:number]


export interface Page{
    flowFragments:FlowFragment[];
    elementsFragments:ElementFragment[]
}

export interface FlowFragment{
    startCoordinate: CoordinateInPixels;
    size:SizeInPixels;
    id:string;
    indexInPage:number;
    indexInFlow:number;
    elementFragments:ElementFragment[]
    

}

export interface ElementFragment{
    startCoordinate: CoordinateInPixels;
    size:SizeInPixels;
    flowId:string,
    flowColumn:number
    id:string;
    indexInElement:number,
    indexInFlow:number,
    type:string,
    optionsToRender:ElementFragmentOptionsToRender
}


export interface ElementFragmentOptionsToRender{
    content?:any,
    params?:any
}