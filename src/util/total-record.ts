export const totalRecord = (obj: any): number => {
    const recordsArr = Object.keys(obj);
    const totalRecord: number = recordsArr.reduce((prev: any, cur: any) => {
        return prev + obj[cur];
    }, 0);

    return totalRecord;
};