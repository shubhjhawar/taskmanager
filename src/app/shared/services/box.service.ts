import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Board} from "../../models/board.model";
import {DATABASE_ENDPOINT} from "../constants";
import {Column} from "../../models/column.model";

@Injectable({
  providedIn: 'root'
})
export class BoxService {

  constructor(
    private httpClient: HttpClient
  ) { }

  getBox(): Observable<Board> {
    return this.httpClient.get<Board>( `${DATABASE_ENDPOINT}/boxManager/getBox`);
  }

  addBox(column: Column): Observable<Column> {
    return this.httpClient.post<Column>(`${DATABASE_ENDPOINT}/boxManager/addBox`, column);
  }

  editBoxName(id: string, column: Column): Observable<Column> {
    return this.httpClient.patch<Column>(`${DATABASE_ENDPOINT}/boxManager/updateNameBox/` + id, column);
  }

  deleteBox(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${DATABASE_ENDPOINT}/boxManager/deleteBox/`+ id);
  }
}
