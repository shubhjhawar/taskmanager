import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import { NgIf } from '@angular/common';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDrag,
  CdkDropList,
} from '@angular/cdk/drag-drop';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { Column } from '../../models/column.model';
import { AddTaskDialogComponent } from '../add-task-dialog/add-task-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Task } from '../../models/task.model';
import { TaskItemComponent } from '../task-item/task-item.component';
import { FormsModule } from '@angular/forms';
import { Board } from '../../models/board.model';
import {
  isToday,
  isTomorrow,
  isThisWeek,
  isNextWeek,
  isThisMonth,
  isNextMonth,
  isThisQuarter,
  isNextQuarter,
  isThisYear,
  isNextYear
} from '../../../utils/date-utils';
import {TaskService} from "../../shared/services/task.service";
import { isCurrentMonth, isCurrentQuarter, isCurrentWeek, isCurrentYear, isPastDate } from '../../../utils/filter-utils';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [DragDropModule, AddTaskDialogComponent, TaskItemComponent, NgIf, FormsModule],
  templateUrl: './board.component.html',
  styleUrl: './board.component.css',
})
export class BoardComponent implements OnInit {
  @Input() board!: Board;
  @Input() column!: Column;


  ngOnInit(): void {
    this._sortArrayOutTime();
  }
  @Output() eventDrag = new EventEmitter();
  @Output() eventChangeName: EventEmitter<Column> = new EventEmitter<Column>();
  constructor(
    private dialog: MatDialog,
    private taskService: TaskService
  ) {

  }

  drop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      // drag drop in same column
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      // Update localStorage for same column

      // getting localstorage and columnName
      const boardFromLocalStorage = JSON.parse(localStorage.getItem("board") || "{}");
      const columnName = event.container.element.nativeElement.getAttribute('data-column-name');

      if (columnName) {
        // finding the column to update
        const columnToUpdate = boardFromLocalStorage.columns.find((col: Column) => col.name === columnName);
        if (columnToUpdate) {
          // Update tasks array in localStorage with the new order
          columnToUpdate.tasks = event.container.data;
        } else {
          console.error("Column not found in localStorage:", columnName);
        }
      } else {
        console.error("Column name not found in data attribute.");
      }
    } else {
      // Transfer task from previous column to current column
      const previousColumnName = event.previousContainer.element.nativeElement.getAttribute('data-column-name');

      // drag drop in different column
      const taskToMove = event.previousContainer.data[event.previousIndex];

      taskToMove.newColumnName = event.container.element.nativeElement.getAttribute('data-column-name') as any;
      this.taskService.editTask(taskToMove._id, taskToMove).subscribe();
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // getting localstorage and columnName
      const boardFromLocalStorage = JSON.parse(localStorage.getItem("board") || "{}");
      const columnName = event.container.element.nativeElement.getAttribute('data-column-name');

      if (previousColumnName && columnName) {
        // finding the two columns
        const prevColToUpdate = boardFromLocalStorage.columns.find((col: Column) => col.name === previousColumnName);
        prevColToUpdate.tasks = prevColToUpdate.tasks.filter((task: Task) => task._id !== taskToMove._id);
        const columnToUpdate = boardFromLocalStorage.columns.find((col: Column) => col.name === columnName);

        if (prevColToUpdate && columnToUpdate) {
          // updating the two columns
          prevColToUpdate.tasks = event.previousContainer.data.filter((task: Task) => task._id !== taskToMove._id);
          columnToUpdate.tasks = event.container.data;

          this.eventDrag.emit(this.board.columns);
          localStorage.setItem("board", JSON.stringify(boardFromLocalStorage));
        } else {
          console.error("Column not found in localStorage:", columnName);
        }
      } else {
        console.error("Column name not found in data attribute.");
      }

    }
  }

  isEditingColumn = false;
  editedColumnName = '';
  @Output() ColumnDeleted: EventEmitter<Column> = new EventEmitter<Column>();

  openTaskDialog() {
    this.dialog.open(AddTaskDialogComponent);
  }

  addTask(task: Task): void {
    const newTask = new Task(task.heading, task.description, task.fixed_dueDate, task.variable_dueDate, null, false, null, null, false, task._id, '');
    const columnName = this.column.name;

    const boardFromLocalStorage = JSON.parse(localStorage.getItem("board") || "{}");
   // const columnToUpdate = boardFromLocalStorage.columns.find((col: Column) => col.name === columnName);
    const columnToUpdate = boardFromLocalStorage.columns.find((col: Column) =>  col.name.toLowerCase() === this.filterTask(newTask.fixed_dueDate));

    if (columnToUpdate) {
      const  newDate = this.formatDate(newTask.fixed_dueDate);
      if (isPastDate(newDate.year, newDate.month, newDate.day + 1)) {
        newTask.outTime = true;
      }
      columnToUpdate.tasks.push(newTask);
      localStorage.setItem("board", JSON.stringify(boardFromLocalStorage));
    } else {
       console.error("Column not found in localStorage:", columnName);
    }
    const index = this.board.columns.findIndex((el: any) => el.name === columnToUpdate.name);
    if(index !== undefined) {
      this.board.columns[index].tasks.push(newTask);
      this._sortArrayOutTime();
    }

    this.taskService.addTask(newTask).subscribe()
  }

  formatDate(date: Date): {day: number, month: number, year: number} {
    date = new Date(date)
    const day = Number(date.getDate().toString().padStart(2, '0'));
    const month = Number((date.getMonth() + 1).toString().padStart(2, '0'));
    const year = date.getFullYear();
    return {day,month,year}
  }

  filterTask(date: Date): string {
    const {day,month, year} = this.formatDate(new Date());
    const  newDate = this.formatDate(date)
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

  onDeleteTask(task: Task): void {
    const index = this.column.tasks.findIndex((t: Task) => t === task);

    if (index !== -1) {
      this.column.tasks = this.column.tasks.filter((t: Task) => t._id !== task._id);
//      this.column.tasks.splice(index, 1);

      const columnName = this.column.name;
      const boardFromLocalStorage = JSON.parse(localStorage.getItem("board") || "{}");
      const columnToUpdate = boardFromLocalStorage.columns.find((col: Column) => col.name === columnName);

      if (columnToUpdate) {
          const taskIndexToDelete = columnToUpdate.tasks.findIndex((t: Task) => t.heading === task.heading);

          if (taskIndexToDelete !== -1) {
              columnToUpdate.tasks.splice(taskIndexToDelete, 1);
              localStorage.setItem("board", JSON.stringify(boardFromLocalStorage));
          } else {
              console.error("Task not found in columnToUpdate tasks:", task);
          }
      } else {
          console.error("Column not found in localStorage:", columnName);
      }
    }

    this.taskService.deleteTask(task._id).subscribe();
  }



  toggleEditColumn() {
    this.isEditingColumn = !this.isEditingColumn;
    if (this.isEditingColumn) {
      this.editedColumnName = this.column.name;
    }
  }

  onEditColumn() {
    this.column.name = this.editedColumnName;
    this.isEditingColumn = false;
    this.eventChangeName.emit(this.column);
  }

  onDeleteColumn(column: Column): void {
    console.log("this working")
    this.ColumnDeleted.emit(column)
  }

  filterTasks(columnName: string, tasks: Task[]): Task[] {
    const currentDate = new Date();
    let uniqueTasks: Map<string, Task> = new Map();

    tasks?.forEach(task => {
        uniqueTasks.set(task.heading, task);
    });
    // console.log(columnName)
    // console.log(uniqueTasks)
    let visibleTasks: Task[] = [];

    uniqueTasks.forEach((task, key) => {
      const timeInQuestion = new Date(task.fixed_dueDate)
      if(!task.repeat){
        visibleTasks.push(task)
      }

      // Include tasks based on their repeat frequency and the specified column
      if (task.repeatFrequency === 'daily' && (columnName === "Today" || columnName === "Tomorrow")) {
          visibleTasks.push(task);
      } else if (task.repeatFrequency === 'weekly' && (columnName === "This Week" || columnName === "Next Week")) {
          visibleTasks.push(task);
      } else if (task.repeatFrequency === 'monthly' && (columnName === "This Month" || columnName === "Next Month")) {
          visibleTasks.push(task);
      } else if (task.repeatFrequency === 'yearly' && (columnName === "This Year" || columnName === "Next Year")) {
          visibleTasks.push(task);
      } else if (columnName === "This Quarter" || columnName === "Next Quarter") {
          visibleTasks.push(task);
      }

      // if(task.repeatFrequency === 'daily' && columnName==="Today"){
      //   // if(isToday(timeInQuestion)){
      //     visibleTasks.push(task)
      //   // }
      // } else if(task.repeatFrequency === 'daily' && columnName==="Tomorrow"){
      //   // if(isTomorrow(timeInQuestion)){
      //     visibleTasks.push(task)
      //   // }
      // } else if(task.repeatFrequency === 'weekly' && columnName==="This Week"){
      //   // if(isThisWeek(timeInQuestion)){
      //     visibleTasks.push(task)
      //   // }
      // } else if(task.repeatFrequency === 'weekly' && columnName==="Next Week"){
      //   // if(isNextWeek(timeInQuestion)){
      //     visibleTasks.push(task)
      //   // }
      // } else if(task.repeatFrequency === 'monthly' && columnName==="This Month"){
      //   // if(isThisMonth(timeInQuestion)){
      //     visibleTasks.push(task)
      //   // }
      // } else if(task.repeatFrequency === 'monthly' && columnName==="Next Month"){
      //   // if(isNextMonth(timeInQuestion)){
      //     visibleTasks.push(task)
      //   // }
      // } else if(task.repeatFrequency === 'yearly' && columnName==="This Year"){
      //   // if(isThisYear(timeInQuestion)){
      //     visibleTasks.push(task)
      //   // }
      // } else if(task.repeatFrequency === 'yearly' && columnName==="Next Year"){
      //   // if(isNextYear(timeInQuestion)){
      //     visibleTasks.push(task)
      //   // }
      // } else if(columnName==="This Quarter"){
      //   // if(isThisQuarter(timeInQuestion)){
      //     visibleTasks.push(task)
      //   // }
      // } else if(columnName==="Next Quarter"){
      //   // if(isNextQuarter(timeInQuestion)){
      //     visibleTasks.push(task)
      //   // }
      // }

    })
    // Convert the map values (unique tasks) back to an array and return it
    // console.log("check here-",columnName, visibleTasks.values())
    return [... new Set(Array.from(visibleTasks.values()))];
  }

  addRepeatTasks(repeatedTasks: Task[]): void {
    repeatedTasks.forEach(task => {
      const dueDate = task.fixed_dueDate;
      task.repeat = true;
      if (!dueDate) return; // Skip tasks with no due date
      for (const column of this.board.columns) {
        if (this.isTaskInColumnTimeFrame(task, column)) {
          column.tasks.push(task);

          // Store the updated board in local storage
          const boardFromLocalStorage = JSON.parse(localStorage.getItem("board") || "{}");
          const columnToUpdate = boardFromLocalStorage.columns.find((col: Column) => col.name === column.name);
          if (columnToUpdate) {
            columnToUpdate.tasks.push(task);
            localStorage.setItem("board", JSON.stringify(boardFromLocalStorage));
          } else {
            console.error("Column not found in localStorage:", column.name);
          }

          break;
        }
      }
    });
  }


  isTaskInColumnTimeFrame(task: Task, column: Column): boolean {
    const dueDate = new Date(task.fixed_dueDate);
    switch (column.name) {
      case 'Today':
        return isToday(dueDate);
      case 'Tomorrow':
        return isTomorrow(dueDate);
      case 'This Week':
        return isThisWeek(dueDate);
      case 'Next Week':
        return isNextWeek(dueDate);
      case 'This Month':
        return isThisMonth(dueDate);
      case 'Next Month':
        return isNextMonth(dueDate);
      case 'This Quarter':
        return isThisQuarter(dueDate);
      case 'Next Quarter':
        return isNextQuarter(dueDate);
      case 'This Year':
        return isThisYear(dueDate);
      case 'Next Year':
        return isNextYear(dueDate);
      default:
        return false;
    }
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
}
