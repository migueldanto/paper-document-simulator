import ElementInPage from "../utils/ElementInPage";

export default class Image extends ElementInPage{
    private _height:number
    private _width?:number

    constructor(options:ImageOptions){
        super({id:options.id,type:'image'})
        this._height = options.height
        this._width = options.width
    }
}

export interface ImageOptions {
    id:string,
    /**
     * Altura en centimetros, que son las unidades de la pagina
     */
    height:number,
    width?:number,
    url:string
}