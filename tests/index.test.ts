import {Flow, Pages} from "../src/index";
import {Paragraph} from "../src/elements"
import { factorCm2Px } from "../src/utils/Sizes";

describe("Medidas de las paginas",()=>{
    test("Paginas sin opciones quedan con la medida carta y en vertical",()=>{
        expect(new Pages({}).sizePageinPixels[0]).toBe(21.6* factorCm2Px)
    })

    test("Paginas en horizontal y con el tamaño carta por default",()=>{
        expect(new Pages({orientation:"h"}).sizePageinPixels[1]).toBe(21.6* factorCm2Px)
    })

    
})

describe("Posiciones de los elementos",()=>{
    test("Agregando elementos en un flow en posiciones especificas",()=>{
        const flow = new Flow({id:"flow1",columns:2,widthFractions:[.5,.5],gap:1,autoDisributeContent:false})
        
        new Pages({},[flow])
        
        const parrafox = new Paragraph({id:"px",text:"parrafo x ?"})
        parrafox.addToFlow(flow)
        const parrafoy = new Paragraph({id:"py",text:"parrafo y ?"})
        parrafoy.addToFlow(flow,0)
        //el parrafo x deberia tomar la posicion 1
        expect(parrafox.position.positionInFlow).toBe(1)
        expect(parrafoy.position.positionInFlow).toBe(0)
    })
})