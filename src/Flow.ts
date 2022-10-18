import Pages from "./Pages"
import ElementInPage, { CounterSize } from "./utils/ElementInPage"
import PositionOfFlow, { FragmentOfFlow } from "./utils/PositionOfFlow"
import { factorCm2Px } from "./utils/Sizes"
import { BehaviorSubject, debounce, interval } from "rxjs"
import { CoordinateInPixels } from "./utils/Types"

export default class Flow {
    private _id: string
    private _pagesInstance: Pages
    private _elements: Array<ElementInPage> = []
    private _position: PositionOfFlow

    public columns: number
    public widthFractions: Array<number>
    public gap: number
    public autoDisributeContent: boolean

    //listeners
    public positionBehaviorSubject: BehaviorSubject<PositionOfFlow> = new BehaviorSubject<PositionOfFlow>(this.position)



    constructor(flowOptions: FlowOptions) {
        this._id = flowOptions.id
        this.columns = flowOptions.columns
        this.widthFractions = flowOptions.widthFractions
        this.gap = flowOptions.gap
        this.autoDisributeContent = flowOptions.autoDisributeContent
        this._position = new PositionOfFlow(this._id)

    }

    public get id(): string {
        return this._id
    }

    public get elements(): Array<ElementInPage> {
        return this._elements
    }

    public get pagesInstance(): Pages {
        return this._pagesInstance
    }

    public get position(): PositionOfFlow {
        return this._position
    }

    public get widthsColumnsInPixels(): number[] {
        const gapInPx = this.gap * factorCm2Px
        const totalWidhtMinusGap = this._pagesInstance.sizePageInPixelsMinusMargins[0] - (gapInPx * (this.columns - 1))
        return this.widthFractions.map((fractions) => {
            return totalWidhtMinusGap * fractions
        })
    }

    public get elementsAsDictionary(): object {
        return this.elements.reduce((dictionary,element)=>{
            dictionary[element.id] = element
            return dictionary
        },{})
    }


    public addToPagesInstance(pages: Pages) {
        this._pagesInstance = pages
        const size = this._pagesInstance.flows.length
        this._pagesInstance._addFlowAndSuscribe(this)
        this._position.positionInPage = size

    }

    public addElementInPosition(element: ElementInPage, position?: number) {
        element.positionBehaviorSubject.asObservable().pipe(debounce(()=>interval(100))).subscribe(position => {
            this.positionate()
        })
        if (position === undefined || position > this._elements.length) {
            this._elements.push(element)
            element.position.positionInFlow = this._elements.length - 1
            return
        }
        this._elements.splice(position, 0, element)
        element.position.positionInFlow = position
        //hay que asegurarse que los demas elements tambien cambian su position y se posicionan nuevamente, esto porque
        //los elementos que van despues deberian de cambiar de posicion
        this.elements.forEach((el,idx)=>{
            if(idx>position){
                el.position.positionInFlow = idx
            }
        })
    }

    public moveElementToPosition(element:ElementInPage,newPosition:number){
        const fromIndex = element.position.positionInFlow
        //quitando de la posicion inicial (puede ser menor o mayor que la nueve posicion objetivo)
        this.elements.splice(fromIndex,1)
        this.elements.splice(newPosition,0,element)
        //asignar todas las posiciones, para que todo quede en orden
        this.elements.forEach((element,idx)=>{
            element.position.positionInFlow = idx
        })
    }

    public clearElements(forcePositionate:boolean = true){
        this.elements.forEach(element=>{
            element.dispose()
        })
        this._elements = []
        this._position.clearFragments()
        if(forcePositionate){
            this.positionate()
            
        }
        
    }

    /**
     * Retorna el espacio usado por los anteriores flujos sin contar el flujo actual
     * @returns {LastSpaceUsed} Ultimo espacio usado por los anteriores flujos
     */
    public spaceUsedByPreviusFlowsInPage(): LastSpaceUsed {
        let counter = { "0": { height: 0 } }
        const indexThisFlow = this._pagesInstance.flows.findIndex(flow => flow.id === this.id)
        this._pagesInstance.flows.filter((flow, idx) => idx < indexThisFlow)
            .forEach(flow => {
                flow.position.fragments.forEach(fragment => {
                    let page = fragment.page
                    if (!(page in counter)) {
                        counter[page] = { height: 0 }

                    }
                    counter[page].height = counter[page].height + fragment.height
                })
            })

        //last page, last column 
        const lastPage = Object.keys(counter).sort().reverse()[0];
        //console.log(counter)
        return { last: { page: lastPage }, counter: counter }
    }

    private checkAvailabilityToFlow():{
        previusFlowsSpace: LastSpaceUsed,
        spaceReservedByOthers:number,
        availableHeightToFlow:number
    }{
        const previusFlowsSpace = this.spaceUsedByPreviusFlowsInPage();
        const spaceReservedByOthers = previusFlowsSpace.counter[previusFlowsSpace.last.page].height 
        const availableHeightInPage = this.pagesInstance.sizePageinPixels[1] - (this.pagesInstance.pageMargins[2] * factorCm2Px)
        const availableHeightToFlow = availableHeightInPage - spaceReservedByOthers;
        return {
            previusFlowsSpace,
            spaceReservedByOthers,
            availableHeightToFlow
        }
    }


    public positionate() {
        console.log("posicionando en Flow", this.id)
        const {previusFlowsSpace,spaceReservedByOthers} = this.checkAvailabilityToFlow()
        
        
        const startCoordinate:[number,number] = [
            this._pagesInstance.pageMargins[3] * factorCm2Px, 
            (this._pagesInstance.pageMargins[0] * factorCm2Px) + spaceReservedByOthers
        ]
        this._position.startCoordinate = startCoordinate
        
        

        const grossHeightInPagesOfElements = this._elements.map(element => {
            return element.position.getHeightInPagesAndColumns()
        }).reduce((acum, currentObjectMeasuresOfPage) => {
            Object.keys(currentObjectMeasuresOfPage).forEach(pageKey => {
                if (!(pageKey in acum)) {
                    acum[pageKey] = {}
                }
                Object.keys(currentObjectMeasuresOfPage[pageKey]).forEach(flowColumn => {
                    if (!(flowColumn in acum[pageKey])) {
                        acum[pageKey][flowColumn] = 0
                    }
                    acum[pageKey][flowColumn] = acum[pageKey][flowColumn]
                        + currentObjectMeasuresOfPage[pageKey][flowColumn]
                })

                //acum[pageKey] = acum[pageKey] + currentObjectMeasuresOfPage[pageKey]
            })
            return acum
        }, {})

        //console.log(grossHeightInPagesOfElements,"height brutos de los elementos de este flow",this.id)

        const maximumHeightByPage = Object.keys(grossHeightInPagesOfElements)
            .reduce((acum, keyPage) => {
                const medidasByFlowInPage = Object.entries(grossHeightInPagesOfElements[keyPage])
                    .map(entrie => {
                        return <number>entrie[1]
                    })

                acum[keyPage] = Math.max(...medidasByFlowInPage)
                return acum
            }, {})

        this._position.fragments = []
        let contadorHeight: { [key: string]: number } = {}
        contadorHeight[previusFlowsSpace.last.page] = this._position.startCoordinate[1]

        Object.entries(maximumHeightByPage).forEach(([keyPage, value]) => {
            
            if (!(keyPage in contadorHeight)) {
                contadorHeight[keyPage] = this._pagesInstance.pageMargins[0] * factorCm2Px
            }
            const fragment: FragmentOfFlow = {
                height: <number>value,
                page: parseInt(keyPage),
                width: this._pagesInstance.sizePageInPixelsMinusMargins[0],
                startCoordinate: [
                    this._pagesInstance.pageMargins[3] * factorCm2Px,
                    contadorHeight[keyPage]
                ]

            }

            
            this._position.addFragment(fragment)
        })

        this.positionBehaviorSubject.next(this.position)
    }

    /**
     * Retorna la coordenana inicial del numero de columna que se le indique, esto en la primera pagina donde inicia el flow
     * o mejor tambien definir la pagina para mas exactitud ???
     * @param idxColumn 
     * @returns {[number,number]}
     */
    public getStartCoordinateByColumn(idxColumn:number):[number,number]{
        const previusColumns =[...this.widthsColumnsInPixels].slice(0,idxColumn)
        let positionX = previusColumns.reduce((acum,current)=>{
            acum = acum + current
            return acum
        },0)

        const gapInPx = previusColumns.length>0 ? this.gap * factorCm2Px * (previusColumns.length) : 0

        positionX = this.position.startCoordinate[0]+ positionX + gapInPx

        return [positionX,this.position.startCoordinate[1]]
        

    }

    public getStartCoordinateByColumnInPage(idxPage:number,idxColumn:number):CoordinateInPixels{
        const previusColumns =[...this.widthsColumnsInPixels].slice(0,idxColumn)
        let positionX = previusColumns.reduce((acum,current)=>{
            acum = acum + current
            return acum
        },0)

        const gapInPx = previusColumns.length>0 ? this.gap * factorCm2Px * (previusColumns.length) : 0

        
        const coordinateBeginInPage = this.position.fragments.find(fragment=>fragment.page === idxPage)?.startCoordinate
        if(!coordinateBeginInPage){
            //retornar algo inicial para la pagina
            return [this.pagesInstance.pageMargins[3] * factorCm2Px , this.pagesInstance.pageMargins[0] * factorCm2Px]
        }

        positionX = coordinateBeginInPage[0]+ positionX + gapInPx

        return [positionX,coordinateBeginInPage[1]]
    }
}


export interface FlowOptions {
    id: string;
    columns: number;
    widthFractions: Array<number>;
    gap: number;
    autoDisributeContent: boolean;
}

export interface CounterPage {
    [key: string]: CounterSize;
}

export interface LastSpaceUsed {
    last: { page: string };
    counter: CounterPage
}