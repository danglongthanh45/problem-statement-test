import { ImportStatus } from "src/constant/type";

export class ImportHistoryDto {
    id: number;
    filename: string;
    status: ImportStatus;
    userid: number;
}