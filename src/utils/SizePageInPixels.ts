import Pages from "../Pages";
import { factorCm2Px, sizes } from "./Sizes";
import { Size } from "./Types";

export default class SizePageInPixels{
    private _pagesInstance:Pages
    
    constructor(pages:Pages){
        this._pagesInstance = pages
    }

    public get sizePageInPixels():Size{
        const sizeInPixels:Size = [
            sizes[this._pagesInstance.sizePage][0]* factorCm2Px,
            sizes[this._pagesInstance.sizePage][1]* factorCm2Px,
        ]
        return sizeInPixels
        
    }

    public get sizePageInPixelsMinusMargins():Size{
        return [
            this.sizePageInPixels[0] - ((this._pagesInstance.pageMargins[1] * factorCm2Px) + (this._pagesInstance.pageMargins[3] * factorCm2Px)),
            this.sizePageInPixels[1] - ((this._pagesInstance.pageMargins[0] * factorCm2Px) + (this._pagesInstance.pageMargins[2] * factorCm2Px))
        ]
    }

}