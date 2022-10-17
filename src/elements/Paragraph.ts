import ElementInPage, { LastSpaceUsed } from "../utils/ElementInPage";
import { ElementFragmentOptionsToRender } from "../utils/PagesParametersConstructor";
import { factorCm2Px } from "../utils/Sizes";

import TextInLines from "../utils/TextInLines";
import { CoordinateInPixels } from "../utils/Types";

export default class Paragraph extends ElementInPage {

    public linesInFragments: LinesInFragments[] = []
    public lineHeight: number
    private _text: string
    private _fontFamily: string
    private _fontSize: string
    private _fontWeight: FontWeight
    private _spaceLineAfterParagraph: number
    private _spaceLineBeforeParagraph: number


    private _canvasToMeasure: HTMLCanvasElement

    constructor(options: Partial<ParagraphOptions>) {
        super({
            type: "paragraph",
            id: options.id
        })
        this._text = options.text || ""
        this.lineHeight = options.lineHeight || 1.2
        this._fontFamily = options.fontFamily  || "Arial"
        this._fontSize = options.fontSize || "12pt"
        this._fontWeight = options.fontWeight || "normal"
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
    public get fontWeight(): FontWeight {
        return this._fontWeight
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
    public set fontWeight(fontWeight: FontWeight) {
        this._fontWeight = fontWeight
        this.positionate()
    }

    public getLineHeightInPixels(): number {
        const usePtUnits = this._fontSize.includes("pt")
        const fontSize = parseFloat(this._fontSize)
        return usePtUnits
            ? (fontSize * (96 / 72)) * this.lineHeight
            : fontSize * this.lineHeight
    }

    public getSpaceLineAfterParagraphInPixels(): number {
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
        let textLinesInitial = new TextInLines(this._text, `${this._fontWeight} ${this._fontSize} ${this._fontFamily}`, this._canvasToMeasure)
        let lines = textLinesInitial.getLinesInWidth(this.flow.widthsColumnsInPixels[previusElementsSpace.last.column])
        let grossHeight = (lines.length * this.getLineHeightInPixels()) + this.getSpaceLineAfterParagraphInPixels()

        if (grossHeight > availableHeightToElement) {
            //como no cabe esto se repetira hasta que se termine de distribuir el contenido
            this.position.fragments = []
            this.linesInFragments = []

            let missingText = this._text
            let elementSpaceNext = {...previusElementsSpace}
            
            while(missingText.length>0){
                console.log("while..",this.id)
                const nextParams = this.tryDistributeNextSpace(missingText,elementSpaceNext)
                missingText = nextParams.missingText
                elementSpaceNext = {...nextParams.nextElementSpace}
            }
            

        } else {
            //como si cabe esto solo pasa una vez
            const fragment = this.createFragment(previusElementsSpace, grossHeight, startCoordinateOfElement)
            this.position.fragments = [fragment]
            this.linesInFragments = [{ lines: lines, fragmentIdx: 0 }]
        }


        this.sendPositionateEventToSuscribers()
    }

    private tryDistributeNextSpace(
        texto: string, 
        previusElementsSpace:LastSpaceUsed
    ):{
        missingText:string,
        nextElementSpace:LastSpaceUsed

    } {
        //creando las lineas para medirlas y ver donde caben
        const textLines = new TextInLines(texto, `${this._fontWeight} ${this._fontSize} ${this._fontFamily}`, this._canvasToMeasure)
        let lines = textLines.getLinesInWidth(this.flow.widthsColumnsInPixels[previusElementsSpace.last.column])

        //calbulando coordenadas iniciales de donde empezar a medir
        const spaceReservedByOthers = previusElementsSpace.counter[previusElementsSpace.last.page][previusElementsSpace.last.column].height
        const startCoordinateOfFlowInPage = this.flow.position.getStartCoordinateInPage(previusElementsSpace.last.page)
        
        const availableHeightToFlow = ( 
            this.flow.pagesInstance.sizePageinPixels[1] - (this.flow.pagesInstance.pageMargins[2] * factorCm2Px)
        ) - startCoordinateOfFlowInPage[1]
        const availableHeightToElement = availableHeightToFlow - spaceReservedByOthers
        const startCoordinateOfColumnInPage = this.flow.getStartCoordinateByColumnInPage(
            parseInt(previusElementsSpace.last.page),
            parseInt(previusElementsSpace.last.column)
        );
        const startHeight = spaceReservedByOthers === 0 ? startCoordinateOfFlowInPage[1] : startCoordinateOfColumnInPage[1] + spaceReservedByOthers
        let startCoordinateOfFragment: CoordinateInPixels = [
            startCoordinateOfColumnInPage[0],
            startHeight
        ]

        //verificando las lineas que caben 
        const lineasQueCabenEnHeightDisponible = availableHeightToElement / this.getLineHeightInPixels()
        const numeroDeLineasAPosicionar = Math.floor(lineasQueCabenEnHeightDisponible)
        const lineasAPosicionar = lines.slice(0, numeroDeLineasAPosicionar)
        const heightLineasAPosicionar = lineasAPosicionar.length * this.getLineHeightInPixels()
        const heightLineasAPosicionarReal = (heightLineasAPosicionar + this.getSpaceLineAfterParagraphInPixels() <=availableHeightToElement)
            ? heightLineasAPosicionar + this.getSpaceLineAfterParagraphInPixels()
            : heightLineasAPosicionar;

        const fragment = this.createFragment(previusElementsSpace, heightLineasAPosicionarReal, startCoordinateOfFragment)
        this.position.fragments.push(fragment)
        const nextFragmentIdx = this.linesInFragments.length
        this.linesInFragments.push({ lines: lineasAPosicionar, fragmentIdx: nextFragmentIdx })

        const cadenaRestante = lines.slice(numeroDeLineasAPosicionar).flat().join(" ").trim()
        const nextElementSpace = {...ElementInPage.newColumnToSpaceUsed(previusElementsSpace, this.flow)}
        return {
            missingText:cadenaRestante,
            nextElementSpace
        }
    }

    public getOptionsToRenderByFragment(fragment_idx: number): ElementFragmentOptionsToRender {
        return {
            content: this.linesInFragments[fragment_idx].lines,
            params: {
                lineHeight: this.lineHeight,
                fontFamily: this.fontFamily,
                fontSize: this._fontSize
            }
        }
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
    fontWeight: FontWeight;
    spaceLineAfterParagraph?: number;
    spaceLineBeforeParagraph?: number;
}

export type FontWeight = "normal" | "bold" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900"

export interface LinesInFragments {
    lines: string[][],
    fragmentIdx: number
}