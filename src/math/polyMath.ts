export const calcHexPoints = (r: number,h: number, flat: boolean): number[] => {
    if(flat) {
        return [-r, 0,-r/2, h/2,r/2, h/2, r, 0, r/2, -h/2, -r/2, -h/2]
    } else {
        return [-h/2,r/2, 0, r, h/2, r/2, h/2, -r/2, 0, -r, -h/2, -r/2]
    }
}