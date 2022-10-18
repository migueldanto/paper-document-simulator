import { BehaviorSubject } from "rxjs";
import Flow from "../Flow";

export default class PositionOfElement {

    private _positionInFlow: number = NOT_CALCULATED_VALUE_YET
    public fragments: Array<FragmentOfElement> = []
    private _flow: Flow
    public positionInFlowBahaviorSubject: BehaviorSubject<number> = new BehaviorSubject<number>(NOT_CALCULATED_VALUE_YET)

    constructor() {

    }


    public get flow(): Flow {
        return this._flow
    }

    public get positionInFlow():number{
        return this._positionInFlow
    }

    

    public set flow(flow:Flow){
        this._flow = flow
    }

    public set positionInFlow(position:number){
        if(position !== this._positionInFlow){
            this._positionInFlow = position
            this.positionInFlowBahaviorSubject.next(position)
        }
    }

    public getHeightInPagesAndColumns():Object{
        let height_dictionary:Object = this.fragments.reduce((acum,current)=>{
            if(!(current.page+"" in acum)){
                acum[current.page+""] = {}
            }
            if(!(current.flowColumn+"" in acum[current.page+""])){
                acum[current.page+""][current.flowColumn+""] = 0
            }
            
            acum[current.page+""][current.flowColumn+""] = acum[current.page+""][current.flowColumn+""] 
                + current.height

            return acum
        },{})

        

        return height_dictionary
        
    }
    
}

export const NOT_CALCULATED_VALUE_YET: number = -1;


export interface FragmentOfElement {
    flowColumn: number;
    height: number;
    width: number;
    page: number;
    startCoordinate: [x:number,y:number];
}