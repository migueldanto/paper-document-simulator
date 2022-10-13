
import Pages from "../Pages";

export default class PositionOfFlow {

    public positionInPage: number = NOT_CALCULATED_VALUE_YET
    public fragments: Array<FragmentOfFlow> = []
    public startCoordinate: number[] = [0, 0]

    private _pagesInstance: Pages

    constructor() {

    }


    public get pagesInstance(): Pages {
        return this._pagesInstance
    }

    public set pagesInstance(pages: Pages) {
        this._pagesInstance = pages
    }



}

export const NOT_CALCULATED_VALUE_YET: number = -1;


export interface FragmentOfFlow {

    height: number;
    width: number;
    page: number;
    startCoordinate: number[];
}