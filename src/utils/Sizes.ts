import {Size} from "./Types"

export  const sizes: SizesCatalog ={
    'A4': [21.0,29.7],
    'A5': [14.8,21.0],
    'A6': [10.5,14.8],
    'carta':[21.6,27.9],
    'oficio':[21.6,35.6]
}

export const factorCm2Px: number= 	37.7952755906;

export const marginInViewer = 20;

export enum SizePage{
    A4="A4",
    A5="A5",
    A6="A6",
    CARTA ="carta",
    OFICIO="oficio",
}

type SizesCatalog = {
    [key in SizePage]: Size;
}