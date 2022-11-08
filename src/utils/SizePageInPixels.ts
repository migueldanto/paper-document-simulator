import DocumentSimulator from "../DocumentSimulator";
import { factorCm2Px, sizes } from "./Sizes";
import { Size } from "./Types";

export default class SizePageInPixels{
    private _pagesInstance:DocumentSimulator
    
    constructor(pages:DocumentSimulator){
        this._pagesInstance = pages
    }

    public get sizePageInPixels():Size{
        const sizeInPixels:Size = [
            sizes[this._pagesInstance.sizePage][0]* factorCm2Px,
            sizes[this._pagesInstance.sizePage][1]* factorCm2Px,
        ]
        if(this._pagesInstance.orientation === "h"){
            return [sizeInPixels[1],sizeInPixels[0]]
        }
        return sizeInPixels
        
    }

    public get sizePageInPixelsMinusMargins():Size{
        return [
            this.sizePageInPixels[0] - ((this._pagesInstance.pageMargins[1] * factorCm2Px) + (this._pagesInstance.pageMargins[3] * factorCm2Px)),
            this.sizePageInPixels[1] - ((this._pagesInstance.pageMargins[0] * factorCm2Px) + (this._pagesInstance.pageMargins[2] * factorCm2Px))
        ]
    }

    public get marginsInPixels():[top:number,right:number,bottom:number,left:number]{
        return [
            this._pagesInstance.pageMargins[0]* factorCm2Px,
            this._pagesInstance.pageMargins[1]* factorCm2Px,
            this._pagesInstance.pageMargins[2]* factorCm2Px,
            this._pagesInstance.pageMargins[3]* factorCm2Px
        ]
    }

}