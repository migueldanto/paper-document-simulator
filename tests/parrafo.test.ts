import { Flow, Pages } from "../src/index";
import { Paragraph } from "../src/elements"



/*
Ejemplo de retorno de una promesa
describe("algo que debe esperar", () => {
    it("ok1", () => {
        return new Promise(r => setTimeout(r, 2000)).then(() => {

            expect(2 + 2).toBe(4)

        })

    })


})
*/

describe("Calculos de parrafos calculo directo",()=>{
    test("espaciado entre parrafo",()=>{
        const flow = new Flow({id:"flow1",columns:2,widthFractions:[.5,.5],gap:1,autoDisributeContent:false})
        
        new Pages({},[flow])
        const parrafox = new Paragraph({id:"px",text:"parrafo x ?",fontSize:"12px",lineHeight:1,spaceLineAfterParagraph:.5})
        parrafox.addToFlow(flow)

        return new Promise(r => setTimeout(r, 1000)).then(() => {

            expect(parrafox.getSpaceLineAfterParagraphInPixels()).toBe(6)

        })
        
    })

    test("espaciado entre parrafo desde los parametros de renderizacion",()=>{
        const flow = new Flow({id:"flow1",columns:2,widthFractions:[.5,.5],gap:1,autoDisributeContent:false})
        
        new Pages({},[flow])
        const parrafox = new Paragraph({id:"px",text:"parrafo x ?",fontSize:"12px",lineHeight:1,spaceLineBeforeParagraph:.5})
        parrafox.addToFlow(flow)

        return new Promise(r => setTimeout(r, 1000)).then(() => {

            expect(parrafox.getOptionsToRenderByFragment(0).params.paddingTop).toBe("6px")

        })
        
    })
})