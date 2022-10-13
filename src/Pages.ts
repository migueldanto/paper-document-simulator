import Flow from "./Flow"
import SizePageInPixels from "./utils/SizePageInPixels"
import { SizePage, Orientation, Size } from "./utils/Types"

export default  class Pages {

    public sizePage:SizePage
    public orientation:Orientation
    /**
     * Top, Right, Bottom, Left margins
     */
    public pageMargins:PageMargins
    private _sizePageInPixels :SizePageInPixels
    public  flows: Array<Flow> = []
    


    constructor(options:PageOptions,flows:Array<Flow>){
        this.sizePage = options.sizePage
        this.orientation = options.orientation
        this.pageMargins = options.pageMargins
        this._sizePageInPixels = new SizePageInPixels(this)

        flows.forEach(flow=>flow.addToPagesInstance(this))
    }

    public get sizePageinPixels():Size{
        return this._sizePageInPixels.sizePageInPixels
    }

    public get sizePageInPixelsMinusMargins():Size{
        return this._sizePageInPixels.sizePageInPixelsMinusMargins
    }
}


/**
 * Opciones de la creacion de las paginas
 */
export interface PageOptions {
    sizePage:SizePage;
    orientation:Orientation;
    pageMargins: PageMargins;
}

export type PageMargins = [number,number,number,number]