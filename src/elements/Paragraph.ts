    import ElementInPage, { LastSpaceUsed } from "../utils/ElementInPage";
import { FragmentOfElement } from "../utils/PositionOfElement";
import TextInLines from "../utils/TextInLines";

export default class Paragraph extends ElementInPage {

    public linesInFragments: LinesInFragments[] = []
    public lineHeight: number
    private _text: string
    private _fontFamily: string
    private _fontSize: string
    private _spaceLineAfterParagraph :number
    private _spaceLineBeforeParagraph :number


    private _canvasToMeasure: HTMLCanvasElement

    constructor(options: ParagraphOptions) {
        super({
            type: "paragraph",
            id: options.id
        })
        this._text = options.text
        this.lineHeight = options.lineHeight
        this._fontFamily = options.fontFamily
        this._fontSize = options.fontSize
        this._canvasToMeasure = document.createElement("canvas")
        this._spaceLineAfterParagraph = options.spaceLineAfterParagraph || .5
        this._spaceLineBeforeParagraph = options.spaceLineBeforeParagraph || 0

    }

    public get text(): string {
        return this._text
    }

    public get fontFamily(): string {
        return this._fontFamily
    }
    public get fontSize(): string {
        return this._fontSize
    }

    public set text(text: string) {
        this._text = text
        this.positionate()
    }
    public set fontFamily(fontFamily: string) {
        this._fontFamily = fontFamily
        this.positionate()
    }
    public set fontSize(fontSize: string) {
        this._fontSize = fontSize
        this.positionate()
    }

    public getLineHeightInPixels():number {
        const usePtUnits = this._fontSize.includes("pt")
        const fontSize = parseFloat(this._fontSize)
        return usePtUnits 
            ? (fontSize * (96 / 72)) * this.lineHeight 
            : fontSize * this.lineHeight
    }

    public getSpaceLineAfterParagraphInPixels():number{
        const usePtUnits = this._fontSize.includes("pt")
        const fontSize = parseFloat(this._fontSize)
        return usePtUnits 
            ? (fontSize * (96 / 72)) * this._spaceLineAfterParagraph 
            : fontSize * this._spaceLineAfterParagraph
    }

    public positionate() {
        console.log("posicionando en Parrafo", this.id)
        //Aqui es general


        const {
            previusElementsSpace,
            //spaceReservedbyOthers,
            availableHeightToElement,
            //startCoordinateByColumnAndPage
            startCoordinateOfElement
            //availableHeightToFlow
        } = this.checkAvailabilityToElement()

        //aca ya esparticular
        let textLinesInitial = new TextInLines(this._text, `${this._fontSize} ${this._fontFamily}`, this._canvasToMeasure)

        let lines = textLinesInitial.getLinesInWidth(this.flow.widthsColumnsInPixels[previusElementsSpace.last.column])
        let grossHeight = (lines.length * this.getLineHeightInPixels()) + this.getSpaceLineAfterParagraphInPixels()

        if (grossHeight > availableHeightToElement) {
            //cortar las lineas y hacer mas de un fragmento
            let lineasQueCaben = availableHeightToElement / this.getLineHeightInPixels()
            const lineasACortar = Math.floor(lineasQueCaben)
            const linesCortadas = lines.slice(0, lineasACortar)
            const heightLinesCortadas = linesCortadas.length * this.getLineHeightInPixels()

            const fragment = this.createFragment(previusElementsSpace,heightLinesCortadas,startCoordinateOfElement)
            this.position.fragments = [fragment]
            this.linesInFragments = [{ lines: linesCortadas, fragmentIdx: 0 }]
            
            //hacer los parrafos adicionales que se necesiten en otras columnas paginas
            const linesRestantes = lines.slice(lineasACortar).flat().join(" ")
            let textLinesSiguiente = new TextInLines(linesRestantes, `${this._fontSize} ${this._fontFamily}`, this._canvasToMeasure)

            const previusElementsSpaceNext : LastSpaceUsed = ElementInPage.newColumnToSpaceUsed(previusElementsSpace,this.flow)
            const startCoordinateOfColumnInPage = this.flow.getStartCoordinateByColumnInPage(
                parseInt(previusElementsSpaceNext.last.page),
                parseInt(previusElementsSpaceNext.last.column)
            );
            const spaceReservedByOthers = previusElementsSpaceNext.counter[previusElementsSpaceNext.last.page][previusElementsSpaceNext.last.column].height
            let startCoordinateOfFragment = [
                startCoordinateOfColumnInPage[0],
                startCoordinateOfColumnInPage[1] + spaceReservedByOthers
            ]
            const linesSigueinte = textLinesSiguiente.getLinesInWidth(this.flow.widthsColumnsInPixels[previusElementsSpaceNext.last.column ])
            const heightNextParrafo = (linesSigueinte.length * this.getLineHeightInPixels()) + this.getSpaceLineAfterParagraphInPixels()
            const fragment2 = this.createFragment(previusElementsSpaceNext,heightNextParrafo,startCoordinateOfFragment)
            this.position.fragments.push(fragment2)
            this.linesInFragments.push({ lines: linesSigueinte, fragmentIdx: 1 })
            //ahorita solio subi la columna pero deberria, eso esta incorrecto
            
            this.sendPositionateEventToSuscribers()
            return
        }
        const fragment = this.createFragment(previusElementsSpace, grossHeight, startCoordinateOfElement)
        this.position.fragments = [fragment]
        this.linesInFragments = [{ lines: lines, fragmentIdx: 0 }]
        this.sendPositionateEventToSuscribers()
    }
}

export interface ParagraphOptions {
    id: string;
    text: string;
    lineHeight: number;
    fontFamily: string;
    /**
     * Like css , only px or pt units
     */
    fontSize: string;
    spaceLineAfterParagraph?: number
    spaceLineBeforeParagraph?: number
}


export interface LinesInFragments {
    lines: string[][],
    fragmentIdx: number
}