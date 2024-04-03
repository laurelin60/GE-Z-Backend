import { institutionType } from "../util/institution";

export default abstract class Institution {
    protected name: string;
    protected code: string;
    protected geCategories: string[];

    protected constructor(name: string, code: string, geCategories: string[]) {
        this.name = name;
        this.code = code;
        this.geCategories = geCategories;
    }

    abstract getInstitution(): Promise<institutionType>;
}
