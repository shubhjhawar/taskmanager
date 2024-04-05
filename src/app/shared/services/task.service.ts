import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Board} from "../../models/board.model";
import {Column} from "../../models/column.model";
import {DATABASE_ENDPOINT} from "../constants";

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(
    private httpClient: HttpClient
  ) { }

  draggingTasks(board: Column[]): Observable<Column[]> {
    return this.httpClient.put<Column[]>(`${DATABASE_ENDPOINT}/taskManager/updateAllTasks`, board);
  }
}
