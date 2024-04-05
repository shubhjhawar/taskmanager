import {Component, Inject, PLATFORM_ID, EventEmitter, Input, OnInit, DestroyRef} from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDrag,
  CdkDropList,
} from '@angular/cdk/drag-drop';
import { RouterModule } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { Board } from '../../models/board.model';
import { Column } from '../../models/column.model';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AddBoxDialogComponent } from '../../components/add-box-dialog/add-box-dialog.component';
import { BoardComponent } from '../../components/board/board.component';
import { Task } from '../../models/task.model';
import {TaskService} from "../../shared/services/task.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {BoxService} from "../../shared/services/box.service";
import { forkJoin } from 'rxjs';
import { isCurrentMonth, isCurrentQuarter, isCurrentWeek, isCurrentYear, isPastDate } from '../../../utils/filter-utils';
import { isNextMonth, isNextQuarter, isNextWeek } from '../../../utils/date-utils';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-main-view',
  standalone: true,
  imports: [DragDropModule, CommonModule, AddBoxDialogComponent, BoardComponent, RouterModule],
  templateUrl: './main-view.component.html',
  styleUrl: './main-view.component.css'
})
export class MainViewComponent implements OnInit {
  board: Board = new Board('First Board', []);

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private taskService: TaskService,
    private boxService: BoxService,
    private destroyRef: DestroyRef,
  ) {}


  ngOnInit(): void {
    this.initializeBoard();
     // if (isPlatformBrowser(this.platformId)) {
     //   const storedBoard = localStorage.getItem('board');
     //
     //   if (storedBoard) {
     //     this.board = JSON.parse(storedBoard);
     //   } else {
     //     this.initializeBoard();
     //   }
     // }
  }

  initializeBoard(): void {
    forkJoin([
      this.boxService.getBox(),
      this.taskService.getTasks()
    ]).pipe(first()).subscribe(([board, tasks]) => {
      this.board = board || {};
      tasks.forEach((task: Task) => {
        this.addTasksToColumns(task);
      })
    })

}

  addTasksToColumns(task: Task): void {
    const newTask = new Task(task.heading, task.description, task.fixed_dueDate, task.variable_dueDate, null, false, null, null, false, task._id, task.newColumnName);

//    const boardFromLocalStorage = JSON.parse(localStorage.getItem("board") || "{}");
    // const columnToUpdate = boardFromLocalStorage.columns.find((col: Column) => col.name === columnName);
    const columnToUpdate = this.board.columns.find((col: Column) =>  col.name.toLowerCase() === this.filterTask(new Date(newTask.fixed_dueDate), newTask.newColumnName as string));

    if (columnToUpdate) {
      const  newDate = this.formatDate(newTask.fixed_dueDate);
      if (this.isPastDate(newDate.year, newDate.month, newDate.day + 1)) {
        newTask.outTime = true;
      }
      columnToUpdate.tasks.push(newTask);
      localStorage?.setItem("board", JSON.stringify(this.board));
    } else {
//      console.error("Column not found in localStorage:", columnName);
    }
    const index = this.board.columns.findIndex((el: any) => el.name === columnToUpdate?.name);
    if(index !== undefined) {
      this.board.columns[index].tasks.push(newTask);
      this._sortArrayOutTime();
    }

//    this.taskService.addTask(newTask).subscribe()
  }

  filterTask(date: Date, newColumnName: string): string {
    const {day,month, year} = this.formatDate(new Date());
    const  newDate = this.formatDate(date)
    if (newColumnName) {
      return newColumnName.toLowerCase();
    }

    if (isPastDate(newDate.year, newDate.month, newDate.day)) {
      return 'today';
    }
    if (day === this.formatDate(date).day) {
      return 'today';
    }
    if (day + 1 === this.formatDate(date).day) {
      return 'tomorrow'
    }
    if (day + 1 === this.formatDate(date).day) {
      return 'tomorrow'
    }
    if (isCurrentWeek(date)) {
      return 'this week'
    }
    if (isNextWeek(date)) {
      return 'next week'
    }

    if (!isNextWeek(date) && isCurrentMonth(date)) {
      return 'this month'
    }

    if (isNextMonth(date)) {
      return 'next month'
    }

    if (isCurrentQuarter(date)) {
      return 'this quarter'
    }

    if (isNextQuarter(date)) {
      return 'next quarter'
    }

    if(isCurrentYear(date)){
      return 'this year';
    }

    if(!isCurrentYear(date)){
      return 'next year';
    }

    return ''
  }

  formatDate(date: Date): {day: number, month: number, year: number} {
    date = new Date(date)
    const day = Number(date.getDate().toString().padStart(2, '0'));
    const month = Number((date.getMonth() + 1).toString().padStart(2, '0'));
    const year = date.getFullYear();
    return {day,month,year}
  }

  isPastDate(year: number, month: number, day: number): boolean {
    const currentDate = new Date();
    const inputDate = new Date(year, month - 1, day);
    return inputDate < currentDate;
  }

  private _sortArrayOutTime(): void {
    this.board.columns[0].tasks.sort((a, b) => {
      if (a.outTime && !b.outTime) {
        return -1;
      } else if (!a.outTime && b.outTime) {
        return 1;
      } else {
        return 0;
      }
    });
  }

  drop(event: CdkDragDrop<Column[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }

  dragDropped(event: CdkDragDrop<Column[]>) {
    console.log(event, 'dragDropped event');
  }

  eventChangeName(eventColum: any): void {
    this.boxService.editBoxName(eventColum._id, eventColum).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe()
  }

  handleBoxAdded(boxName: string): void {
    // Create a new column with the box name
    const newColumn = new Column(boxName, false, []);
    this.boxService.addBox(newColumn).subscribe((res: any) => {
      this.board.columns.push({...newColumn, _id: res.insertedId});
    })
    localStorage.setItem("board", JSON.stringify(this.board));
  }

  handleBoxDeleted(column: any): void {
    console.log(column)
    const index = this.board.columns.findIndex(c => c === column);
    if (index !== -1) {
      this.board.columns.splice(index, 1); // Remove the column from the array
    }
    this.boxService.deleteBox(column._id).subscribe()
  }

}
