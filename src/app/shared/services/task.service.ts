import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Board} from "../../models/board.model";
import {Column} from "../../models/column.model";
import {DATABASE_ENDPOINT} from "../constants";
import {Task} from "../../models/task.model";

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(
    private httpClient: HttpClient
  ) { }

  addTask(task: Task): Observable<any> {
    return this.httpClient.post<any>(`${DATABASE_ENDPOINT}/boxManager/addTask` , task);
  }

  getTasks(): Observable<any> {
    return this.httpClient.get<any>(`${DATABASE_ENDPOINT}/boxManager/getTasks`);
  }

  editTask(id: string, task: Task): Observable<Column> {
    return this.httpClient.patch<Column>(`${DATABASE_ENDPOINT}/boxManager/updateTask/` + id, task);
  }

  deleteTask(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${DATABASE_ENDPOINT}/boxManager/deleteTask/`+ id);
  }
}
