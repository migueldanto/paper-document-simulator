import ElementInPage, { LastSpaceUsed } from "../utils/ElementInPage";
import { factorCm2Px } from "../utils/Sizes";
import { CoordinateInPixels } from "../utils/Types";

export default class BlankSpace extends ElementInPage{
    
    private _height: number
    
    

    constructor(options:BlankSpaceOptions){
        super({
            id:options.id,
            type:"blankSpace"
        })
        this._height = options.height
    }

    public get height():number{
        return this._height
    }
    public get width():number{
        return this.position.fragments[0].width
    }

    public set height(height:number){
        this._height= height
        this.positionate()
    }
    

    public positionate(){
        console.log("posicionando en Espacio Blanco", this.id)
        const {
            previusElementsSpace,
            availableHeightToElement,
            startCoordinateOfElement
        } = this.checkAvailabilityToElement()

        const grossHeight = this._height * factorCm2Px
        if(grossHeight > availableHeightToElement){
            //pasar a la siguiente pagina o columna todo el elemento
            const previusElementsSpaceNext : LastSpaceUsed = ElementInPage.newColumnToSpaceUsed(previusElementsSpace,this.flow)
            const startCoordinateOfColumnInPage = this.flow.getStartCoordinateByColumnInPage(
                parseInt(previusElementsSpaceNext.last.page),
                parseInt(previusElementsSpaceNext.last.column)
            );
            const spaceReservedByOthers = previusElementsSpaceNext.counter[previusElementsSpaceNext.last.page][previusElementsSpaceNext.last.column].height
            let startCoordinateOfElementInNewColumn:CoordinateInPixels = [
                startCoordinateOfColumnInPage[0],
                startCoordinateOfColumnInPage[1] + spaceReservedByOthers
            ]
            const fragment2 = this.createFragment(previusElementsSpaceNext,grossHeight,startCoordinateOfElementInNewColumn)
            this.position.fragments = [fragment2]
            this.sendPositionateEventToSuscribers()
            return 
        }

        const fragment = this.createFragment(previusElementsSpace, grossHeight, startCoordinateOfElement)
        this.position.fragments = [fragment]
        this.sendPositionateEventToSuscribers()

    }
}


export interface BlankSpaceOptions {
    id:string,
    /**
     * Altura en centimetros, que son las unidades de la pagina
     */
    height:number,
    
}