export default class Parser {
    static getActualPrice(itemPrice: string | null) {
        return itemPrice?.match(/\d+ р./)?.at(0);
    }

    static getPriceValue(itemPrice: string | null | undefined) {
        return Number(itemPrice?.match(/\d+/)?.at(0));
    }
}