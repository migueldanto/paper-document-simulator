export default class TextInLines{
    public text:string;
    public fontOptions:string
    public canvasToMeasure: HTMLCanvasElement
    //public availableWidth:number = 100

    constructor(text:string,fontOptions?:string,canvas?:HTMLCanvasElement){
        this.text =text;
        this.fontOptions = fontOptions || "10pt Arial"
        if(canvas){
            this.canvasToMeasure = canvas
        }
        

    }

    public measureText(text){
        const ctx = <CanvasRenderingContext2D> this.canvasToMeasure.getContext("2d")
        ctx.font = this.fontOptions || "10pt Arial"
        
        
        const measure = ctx.measureText(text)
        return measure.width
    }

    public getLinesInWidth(availableWidth:number):string[][]{
        let words =this.text.split(SPACE_VALUE)
        const sizeSpace:number = this.measureText(SPACE_VALUE)
        let sizes:number[] = words.map(word => this.measureText(word))

        const lines:string[][] = [ [] ];
        let contadorAnchuraLine:number = 0;
        let contadorLine:number = 0
        sizes.forEach((size,index)=>{
            
            
            let proximaAnchura = contadorAnchuraLine
            if(index>0){
                proximaAnchura = proximaAnchura + sizeSpace
            }
            proximaAnchura = proximaAnchura + size

            if(proximaAnchura>availableWidth){
                lines.push([])
                contadorLine++
                proximaAnchura = size
            }
            
            lines[contadorLine].push(words[index])
            
            contadorAnchuraLine = proximaAnchura
            //console.log(contadorAnchuraLine)
        })
        return lines
    }
}

const SPACE_VALUE:string = " ";