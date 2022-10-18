import {BehaviorSubject} from "rxjs"

export default class ImageLoader{
    private _url:string
    private _imageBlob:Blob
    public loadStatusBehaviorSubject: BehaviorSubject<LoadStatus> = new BehaviorSubject<LoadStatus>(LoadStatus.Unload)
    constructor(url:string){
        this._url = url
    }

    public startLoad():void{
        this.loadStatusBehaviorSubject.next(LoadStatus.Loading)
        fetch(this._url,{cache:"force-cache"})
            .then(response=>response.blob())
            .then(imageBlob=>{
                this.loadStatusBehaviorSubject.next(LoadStatus.Load)
                this._imageBlob = imageBlob
            }).catch(error=>{
                this.loadStatusBehaviorSubject.next(LoadStatus.Error)
            }).finally(()=>{
                this.loadStatusBehaviorSubject.complete()
            })
    }

    public get imageBlob():Blob{
        return this._imageBlob
    }

}

enum LoadStatus {
    Unload=0,
    Load=1,
    Loading=2,
    Error=3
}