import Flow from "./Flow"
import SizePageInPixels from "./utils/SizePageInPixels"
import { SizePage, Orientation, Size } from "./utils/Types"
import { BehaviorSubject, debounce, interval, Observable } from "rxjs"
import { generateParamsSimulatorToView, ParamsSimulatorToView } from "./utils/PagesParametersConstructor"

export default class Pages {

    public sizePage: SizePage
    public orientation: Orientation
    /**
     * Top, Right, Bottom, Left margins
     */
    public pageMargins: PageMargins
    private _sizePageInPixels: SizePageInPixels
    public flows: Array<Flow> = []

    private _calculatedPositionsBehaviorSubject: BehaviorSubject<Pages> = new BehaviorSubject<Pages>(this)



    constructor(options: Partial<PageOptions>, flows?: Array<Flow>) {
        this.sizePage = options.sizePage || "carta"
        this.orientation = options.orientation || "v"
        this.pageMargins = options.pageMargins || [1, 1, 1, 1]
        this._sizePageInPixels = new SizePageInPixels(this)
        if (flows) {
            flows.forEach(flow => flow.addToPagesInstance(this))
        }

    }

    public get sizePageinPixels(): Size {
        return this._sizePageInPixels.sizePageInPixels
    }

    public get sizePageInPixelsMinusMargins(): Size {
        return this._sizePageInPixels.sizePageInPixelsMinusMargins
    }

    public get  marginsInPixels():[top:number,right:number,bottom:number,left:number] {
        return this._sizePageInPixels.marginsInPixels
    }

    public _addFlowAndSuscribe(flow: Flow) {
        this.flows.push(flow)
        flow.position.fragmentsBehaviorSubject.asObservable().pipe(debounce(() => interval(100))).subscribe(({ position }) => {

            //cuando un flow acaba de recalcularse deberiamos avisar a los demas elementos que estan despues de el que deben recalcularse
            if (position) {
                //console.log("---> CAMBIO DE elementos dentro FLOW despues de tiempo", position.id)
                //console.log("--->", position.fragments.length, "fragmentos")
                const indiceFlujo = position.positionInPage
                this.flows.filter((f, i) => i > indiceFlujo).forEach(flow => {
                    flow.positionate()
                })
            }
        })

    }

    public getParamsSimulatorToView(): ParamsSimulatorToView {
        return generateParamsSimulatorToView(this)
    }

    public observeCalculatedPosition(): Observable<Pages> {
        this.flows.forEach(flow => {
            flow.positionBehaviorSubject.asObservable().pipe(debounce(() => interval(100))).subscribe((position) => {
                
                this._calculatedPositionsBehaviorSubject.next(this)
            })
        })
        
        return this._calculatedPositionsBehaviorSubject.asObservable()
    }
}


/**
 * Opciones de la creacion de las paginas
 */
export interface PageOptions {
    sizePage: SizePage;
    orientation: Orientation;
    pageMargins: PageMargins;
}

export type PageMargins = [number, number, number, number]