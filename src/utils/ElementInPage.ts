import Flow from "../Flow"
import PositionOfElement, { FragmentOfElement } from "./PositionOfElement"
import { BehaviorSubject, debounce, interval, Subscription } from "rxjs"
import { factorCm2Px } from "./Sizes"
import { CoordinateInPixels } from "./Types"
import { ElementFragmentOptionsToRender } from "./PagesParametersConstructor"

export default class ElementInPage {
    private _id: string
    private _type: string
    private _position: PositionOfElement
    private _flow: Flow;
    private _subscriptions: {[key:string]:Subscription} = {}

    //listeners
    public positionBehaviorSubject: BehaviorSubject<PositionOfElement> = new BehaviorSubject<PositionOfElement>(this.position)

    constructor(options: ElementInPageOptions) {
        this._id = options.id
        this._type = options.type
        this._position = new PositionOfElement()
        if (options.flow) {
            console.log("Esta definido el flow")
        }
    }

    public get id(): string {
        return this._id
    }

    public get flow(): Flow {
        return this._flow
    }

    public get type(): string {
        return this._type
    }

    public get position(): PositionOfElement {
        return this._position
    }

    public addToFlow(flow: Flow) {
        this._flow = flow
        this._flow.addElementInPosition(this)
        //this.positionate()
       
        this._subscriptions["flow_startCoordinate"] = this.flow.position.startCoordinateBehaviorSubject
            .asObservable().pipe(debounce(()=>interval(100))).subscribe(()=>{
                this.positionate()
            })
    }

    public positionate() {
        console.log("No implementado aun")
    }

    public sendPositionateEventToSuscribers():void{
        this.positionBehaviorSubject.next(this.position)
    }

    /**
     * Retorna el ultimo espacio usado por los fragmentos de los anteriores elementos
     * @returns {LastSpaceUsed} ultimo espacio usado
     */
    public spaceUsedByPreviusElementsInFlow(): LastSpaceUsed {
        let counter: CounterPage = { "0": { "0": { height: 0 } } }

        this._flow.elements.filter(element => element.position.positionInFlow < this._position.positionInFlow)
            .forEach(element => {
                element.position.fragments.forEach(fragment => {
                    let page = "" + fragment.page
                    if (!(page in counter)) {
                        counter[page] = {}
                    }
                    let flowColumn = "" + fragment.flowColumn
                    if (!(flowColumn in counter[page])) {
                        counter[page][flowColumn] = { height: 0 }
                    }
                    counter[page][flowColumn].height = counter[page][flowColumn].height + fragment.height
                })
            })

        //last page, last column 
        const lastPage = Object.keys(counter).sort((a, b) => a > b ? -1 : 1)[0];
        const lastColumn = Object.keys(counter[lastPage]).sort((a, b) => a > b ? -1 : 1)[0];
        return { last: { page: lastPage, column: lastColumn }, counter: counter }
    }

    public spaceUsedByCurrentFragments(): LastSpaceUsed {
        const initiaToElement = this.spaceUsedByPreviusElementsInFlow()
        //sumar lo que haya en los actuales fragments
        this.position.fragments.forEach(fragment => {
            let page = "" + fragment.page
            if (!(page in initiaToElement.counter)) {
                initiaToElement.counter[page] = {}
            }
            let flowColumn = "" + fragment.flowColumn
            if (!(flowColumn in initiaToElement.counter[page])) {
                initiaToElement.counter[page][flowColumn] = { height: 0 }
            }
            initiaToElement.counter[page][flowColumn].height = initiaToElement.counter[page][flowColumn].height + fragment.height
        })
        return initiaToElement
    }

    protected checkAvailabilityToElement(): {
        previusElementsSpace: LastSpaceUsed;
        spaceReservedByOthers: number;
        availableHeightToElement: number;
        availableHeightToFlow: number;
        startCoordinateOfColumnInPage: CoordinateInPixels;
        startCoordinateOfElement: CoordinateInPixels;
    } {
        const previusFragmentsSpace = this.spaceUsedByPreviusElementsInFlow()
        const spaceReservedByOthers = previusFragmentsSpace.counter[previusFragmentsSpace.last.page][previusFragmentsSpace.last.column].height
        //console.log(this.flow.position.startCoordinate)
        const startCoordinateOfFlowInPage = this.flow.position.getStartCoordinateInPage(previusFragmentsSpace.last.page)
        const availableHeightToFlow = ( 
                this.flow.pagesInstance.sizePageinPixels[1] - (this._flow.pagesInstance.pageMargins[2] * factorCm2Px)
            ) - startCoordinateOfFlowInPage[1]
        const availableHeightToElement = availableHeightToFlow - spaceReservedByOthers

        const startCoordinateOfColumnInPage:CoordinateInPixels = this.flow.getStartCoordinateByColumnInPage(
            parseInt(previusFragmentsSpace.last.page),
            parseInt(previusFragmentsSpace.last.column)
        );

        const startHeight = spaceReservedByOthers === 0 ? startCoordinateOfFlowInPage[1] : startCoordinateOfColumnInPage[1] + spaceReservedByOthers
        let startCoordinateOfElement:CoordinateInPixels = [
            startCoordinateOfColumnInPage[0],
            startHeight
        ]


        return {
            previusElementsSpace: previusFragmentsSpace,
            spaceReservedByOthers,
            availableHeightToElement,
            availableHeightToFlow,
            startCoordinateOfColumnInPage,
            startCoordinateOfElement
        }
    }

    protected checkAvailabilityToFragment():{
        previusFragmentsSpace:LastSpaceUsed;
            availableHeightToFragment:number
            startCoordinateOfColumnInPage:number[]
            startCoordinateOfFragment:number[]
    } {
        const previusFragmentsSpace = this.spaceUsedByPreviusElementsInFlow()
        const spaceReservedByOthers = previusFragmentsSpace.counter[previusFragmentsSpace.last.page][previusFragmentsSpace.last.column].height
        const availableHeightToFlow = ( this.flow.pagesInstance.sizePageinPixels[1] - this._flow.pagesInstance.pageMargins[2] * factorCm2Px )
            - this.flow.position.startCoordinate[1]
        const availableHeightToFragment = availableHeightToFlow - spaceReservedByOthers

        const startCoordinateOfColumnInPage = this.flow.getStartCoordinateByColumnInPage(
            parseInt(previusFragmentsSpace.last.page),
            parseInt(previusFragmentsSpace.last.column)
        );
        let startCoordinateOfFragment = [
            startCoordinateOfColumnInPage[0],
            startCoordinateOfColumnInPage[1] + spaceReservedByOthers
        ]

        return {
            previusFragmentsSpace,
            availableHeightToFragment,
            startCoordinateOfColumnInPage,
            startCoordinateOfFragment

        }
    }

    public createFragment(previusFragmentsSpace: LastSpaceUsed, heightFragment:number, startCoordinateOfFragment: [x:number,y:number]): FragmentOfElement {
        const fragment: FragmentOfElement = {
            page: parseInt(previusFragmentsSpace.last.page),
            flowColumn: parseInt(previusFragmentsSpace.last.column),
            height: heightFragment,
            width: this.flow.widthsColumnsInPixels[previusFragmentsSpace.last.column],
            startCoordinate: startCoordinateOfFragment
        }
        

        return fragment
    }

    public static newColumnToSpaceUsed(spaceUsed:LastSpaceUsed,flow:Flow){
        const _spaceUsed = {...spaceUsed}
        let nextColumn = parseInt(_spaceUsed.last.column) +1
        nextColumn = nextColumn % flow.columns   === 0 ? 0 : nextColumn
        _spaceUsed.last.column = nextColumn+""
        _spaceUsed.last.page = nextColumn ===0 ? (parseInt(_spaceUsed.last.page) + 1)+"" : _spaceUsed.last.page

        if(!(_spaceUsed.last.page in _spaceUsed.counter)){
            _spaceUsed.counter[_spaceUsed.last.page] = {}
        }
        if(!(_spaceUsed.last.column in _spaceUsed.counter[_spaceUsed.last.page])){
            _spaceUsed.counter[_spaceUsed.last.page][_spaceUsed.last.column] = {height:0}
        }

        return _spaceUsed

    }

    public getOptionsToRenderByFragment(fragment_idx:number):ElementFragmentOptionsToRender{
        return {}
    }

    public dispose(){
        this._subscriptions["flow_startCoordinate"].unsubscribe()
        this.positionBehaviorSubject.complete()
        
    }
}

export interface ElementInPageOptions {
    type: string;
    id: string;
    flow?: Flow;
}

export interface CounterPage {
    [key: string]: CounterFlow;
}

export interface CounterFlow {
    [key: string]: CounterSize;
}

export interface CounterSize {
    height: number;
}

export interface LastSpaceUsed {
    last: { page: string, column: string };
    counter: CounterPage

}