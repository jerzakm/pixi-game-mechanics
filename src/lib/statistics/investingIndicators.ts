export const movingAverage = (data: number[], timePeriods: number): number[] => {
    const SMAs: number[] = []
    for(let i =0; i<data.length;i++) {
        let sma = 0
        if (i < data.length-timePeriods) {
            
            let sum = 0;
            let count = 0;
            for(let n = 0; n<timePeriods;n++) {
                sum+= data[i+n]
                count++
            }
            sma = sum/count
        }        
        SMAs.push(sma)
    }
    return SMAs;
}


