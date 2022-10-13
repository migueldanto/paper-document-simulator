import Flow from "../Flow"
import PositionOfElement, { FragmentOfElement } from "./PositionOfElement"
import { BehaviorSubject } from "rxjs"
import { factorCm2Px } from "./Sizes"

export default class ElementInPage {
    private _id: string
    private _type: string
    private _position: PositionOfElement
    private _flow: Flow;

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
        this.positionate()
    }

    public positionate() {
        console.log("No implementado aun")
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
        startCoordinateOfColumnInPage: number[];
        startCoordinateOfElement: number[];
    } {
        const previusFragmentsSpace = this.spaceUsedByPreviusElementsInFlow()
        const spaceReservedByOthers = previusFragmentsSpace.counter[previusFragmentsSpace.last.page][previusFragmentsSpace.last.column].height
        const availableHeightToFlow = ( this.flow.pagesInstance.sizePageinPixels[1] - this._flow.pagesInstance.pageMargins[2] * factorCm2Px )
        - this.flow.position.startCoordinate[1]
        const availableHeightToElement = availableHeightToFlow - spaceReservedByOthers

        const startCoordinateOfColumnInPage = this.flow.getStartCoordinateByColumnInPage(
            parseInt(previusFragmentsSpace.last.page),
            parseInt(previusFragmentsSpace.last.column)
        );

        const startHeight = spaceReservedByOthers === 0 ? this._flow.position.startCoordinate[1] : startCoordinateOfColumnInPage[1] + spaceReservedByOthers
        let startCoordinateOfElement = [
            startCoordinateOfColumnInPage[0],
            startHeight
        ]

        console.log(startCoordinateOfColumnInPage,previusFragmentsSpace,"AQUI EN EL CALCULO",this.id)

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

    public createFragment(previusFragmentsSpace: LastSpaceUsed, heightFragment:number, startCoordinateOfFragment: number[]): FragmentOfElement {
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
        let nextColumn = parseInt(spaceUsed.last.column) +1
        nextColumn = nextColumn % flow.columns   === 0 ? 0 : nextColumn
        spaceUsed.last.column = nextColumn+""
        spaceUsed.last.page = nextColumn ===0 ? (parseInt(spaceUsed.last.page) + 1)+"" : spaceUsed.last.page

        if(!(spaceUsed.last.page in spaceUsed.counter)){
            spaceUsed.counter[spaceUsed.last.page] = {}
        }
        if(!(spaceUsed.last.column in spaceUsed.counter[spaceUsed.last.page])){
            spaceUsed.counter[spaceUsed.last.page][spaceUsed.last.column] = {height:0}
        }

        return spaceUsed

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