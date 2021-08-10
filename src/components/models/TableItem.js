export default class TableItem {
    constructor(origin, index) {
        this.id = origin.id ?? index;
        this.name = origin.name;
        this.value = origin.value;
        this.editable = origin.editable ?? false;
        this.new = origin.new ?? false;
    }
}