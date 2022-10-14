
import { BehaviorSubject, debounce } from "rxjs";
import Pages from "../Pages";
import { CoordinateInPixels } from "./Types";

export default class PositionOfFlow {

    public positionInPage: number = NOT_CALCULATED_VALUE_YET
    public fragments: Array<FragmentOfFlow> = []
    private _startCoordinate: [number, number] = [0, 0]
    private _id: string

    private _pagesInstance: Pages

    public startCoordinateBehaviorSubject: BehaviorSubject<ChangeStartCoordinatePositionOfFlow>
        = new BehaviorSubject<ChangeStartCoordinatePositionOfFlow>({ value: this.startCoordinate })

    public fragmentsBehaviorSubject: BehaviorSubject<ChangeFragmentsPositionOfFlow>
        = new BehaviorSubject<ChangeFragmentsPositionOfFlow>({ value: this.fragments })

    constructor(id: string) {
        this._id = id
    }

    public get id(): string {
        return this._id
    }

    public set startCoordinate(coordinate: [number, number]) {

        if (coordinate[0] !== this._startCoordinate[0] || coordinate[1] !== this._startCoordinate[1]) {
            this._startCoordinate = coordinate
            this.startCoordinateBehaviorSubject.next({ value: coordinate, position: this })
            return
        }


    }

    public get startCoordinate(): [number, number] {
        return this._startCoordinate
    }

    public get pagesInstance(): Pages {
        return this._pagesInstance
    }

    public set pagesInstance(pages: Pages) {
        this._pagesInstance = pages
    }


    public addFragment(fragment: FragmentOfFlow) {
        this.fragments.push(fragment)
        this.fragmentsBehaviorSubject.next({ value: this.fragments, position: this })
    }

    public clearFragments(){
        this.fragments = []
        this.fragmentsBehaviorSubject.next({ value: this.fragments, position: this })
    }

    public getStartCoordinateInPage(pageIndex: string): CoordinateInPixels {
        //let dict = { "0": { coord: 0 } }
        if (this.fragments.length === 0) {
            return this._startCoordinate
        }

        const dict = this.fragments.reduce((acum, current) => {
            acum[current.page] = current.startCoordinate
            return acum
        }, {})
        return dict[pageIndex] || this._startCoordinate


    }

}

export const NOT_CALCULATED_VALUE_YET: number = -1;


export interface FragmentOfFlow {

    height: number;
    width: number;
    page: number;
    startCoordinate: [x: number, y: number];
}

export interface ChangeStartCoordinatePositionOfFlow {
    value: [number, number],
    position?: PositionOfFlow
}

export interface ChangeFragmentsPositionOfFlow {
    value: FragmentOfFlow[],
    position?: PositionOfFlow
}