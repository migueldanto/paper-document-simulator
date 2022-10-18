export default function logger(allow:boolean,...args:any[]):void{
    if(allow){
        console.log(...args)
    }

}