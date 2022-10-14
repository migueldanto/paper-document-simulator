import {Pages} from "../src/index";
import { factorCm2Px } from "../src/utils/Sizes";

describe("Medidas de las paginas",()=>{
    test("Paginas sin opciones quedan con la medida carta y en vertical",()=>{
        expect(new Pages({}).sizePageinPixels[0]).toBe(21.6* factorCm2Px)
    })

    test("Paginas en horizontal y con el tamaño carta por default",()=>{
        expect(new Pages({orientation:"h"}).sizePageinPixels[1]).toBe(21.6* factorCm2Px)
    })

    
})