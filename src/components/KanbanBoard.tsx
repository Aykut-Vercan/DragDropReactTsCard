import { useMemo, useState } from "react";
import PlusIcon from "../icons/PlusIcon";
import { Column, Id, Task } from "../types";
import ColumnContainer from "./ColumnContainer";
import { DndContext, DragOverlay, DragStartEvent, DragEndEvent, useSensors, useSensor, PointerSensor, DragOverEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import TaskCard from "./TaskCard";

function KanbanBoard() {
    const [columns, setColumns] = useState<Column[]>([]);
    const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

    const [tasks, setTasks] = useState<Task[]>([])

    const [activeColumn, setActiveColumn] = useState<Column | null>(null);
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    //useSensors silmek istediğimizde taşımayı engellemesi için yapıyoruz
    const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: {
            distance: 10//bu px kadar oynamadıysa buttona basabiliriz delete
        }
    }));

    //Column olusturma
    function generateId() {
        return Math.floor(Math.random() * 10001);
    }

    function createNewColumn() {
        const columToAdd: Column = {
            id: generateId(),
            title: `Column ${columns.length + 1}`,
        };
        setColumns([...columns, columToAdd]);
    }

    function updateColumnHandler(id: Id, title: string) {
        const newColumns = columns.map(col => {
            if (col.id !== id) return col;
            return { ...col, title }
        })
        setColumns(newColumns)
    }

    function deleteColumnHandler(id: Id) {
        const filtredColumns = columns.filter((col) => col.id !== id);
        setColumns(filtredColumns);

        const newTask = tasks.filter(t => t.columnId !== id)
        setTasks(newTask)
    }

    //column için task olusturma
    function createTaskForColumn(columnId: Id) {
        const newTask: Task = {
            id: generateId(),
            columnId,
            content: `Task ${tasks.length + 1}`
        }
        setTasks([...tasks, newTask])
    }
    function updateTask(id: Id, content: string) {
        const newTasks = tasks.map(task => {
            if (task.id !== id) return task;
            return { ...task, content }
        })
        setTasks(newTasks)
    }
    //deleteTask
    function deleteTask(taskId: Id) {
        const filteredTask = tasks.filter(task => task.id !== taskId)
        setTasks(filteredTask)
    }




    /*Drag drop fonksiyonları*/
    function onDragStart(e: DragStartEvent) {
        console.log("drag start", e);
        if (e.active.data.current?.type === "Column") {
            setActiveColumn(e.active.data.current.column);
            return;
        }
        if (e.active.data.current?.type === "Task") {
            setActiveTask(e.active.data.current.task);
            return;
        }
    }

    function onDragEnd(e: DragEndEvent) {
        setActiveColumn(null)
        setActiveTask(null)
        const { active, over } = e
        if (!over) return
        const activeColumnId = active.id
        const overColumnId = over.id
        if (activeColumnId === overColumnId) return
        setColumns(columns => {
            const activeColumnIndex = columns.findIndex(col => col.id === activeColumnId)
            const overColumnIndex = columns.findIndex(col => col.id === overColumnId)
            return arrayMove(columns, activeColumnIndex, overColumnIndex)//bizim için dnd bunu swaplayacak
        })
    }

    function onDragOver(e: DragOverEvent) {
        const { active, over } = e
        if (!over) return
        const activeId = active.id
        const overId = over.id
        if (activeId === overId) return

        const isActiveTask = active.data.current?.type === "Task";
        const isOverTask = over.data.current?.type === "Task";

        if (!isActiveTask) return

        //task'ı diğer taskın üzerine bırakma
        if (isActiveTask && isOverTask) {
            setTasks(tasks => {
                const activeIndex = tasks.findIndex((t) => t.id === activeId)
                const overIndex = tasks.findIndex((t) => t.id === overId)
                tasks[activeIndex].columnId = tasks[overIndex].columnId

                return arrayMove(tasks, activeIndex, overIndex)//arrayMove=>arrayı farklı bir pozisyona tasımayı saglıyor
            })
        }


        const isOverColumn = over.data.current?.type === "Column";

        if (isActiveTask && isOverColumn) {
            setTasks(tasks => {
                const activeIndex = tasks.findIndex((t) => t.id === activeId)
                tasks[activeIndex].columnId = overId

                return arrayMove(tasks, activeIndex, activeIndex)//arrayMove=>arrayı farklı bir pozisyona tasımayı saglıyor
            })
        }


        //task'ı column üzerine bbırakma


    }



    return (
        <div
            className="
                m-auto
                flex
                min-h-screen
                w-full
                items-center
                overflow-x-auto
                overflow-y-hidden
                px-[40px]
                "
        >
            <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragOver={onDragOver}>
                <div className="m-auto flex gap-2">
                    <div className="flex gap-4">
                        <SortableContext items={columnsId}>
                            {columns.map((col) => (
                                <ColumnContainer
                                    key={col.id}
                                    column={col}
                                    deleteColumn={deleteColumnHandler}
                                    updateColumn={updateColumnHandler}
                                    createTask={createTaskForColumn}
                                    tasks={tasks.filter(task => task.columnId === col.id)}
                                    deleteTask={deleteTask}
                                    updateTask={updateTask}
                                />
                            ))}
                        </SortableContext>
                    </div>

                    <button
                        className="
                            h-[60px]
                            w-[350px]
                            min-w-[350px]
                            cursor-pointer
                            rounded-lg
                            bg-mainBackgroundColor
                            border-2
                            border-columnBackgroundColor
                            p-4
                            ring-rose-500
                            hover:ring-1
                            flex
                            gap-8"
                        onClick={createNewColumn}
                    >
                        <PlusIcon />
                        Add Column
                    </button>
                </div>
                {createPortal(//buradaki create portal olayı dom'un manipülasyonundaki hataları gidermek amacıyla yeni node eklenmesi
                    <DragOverlay>
                        {activeColumn && (
                            <ColumnContainer
                                column={activeColumn}
                                deleteColumn={deleteColumnHandler}
                                updateColumn={updateColumnHandler}
                                createTask={createTaskForColumn}
                                tasks={tasks.filter(task => task.columnId === activeColumn.id)}
                                deleteTask={deleteTask}
                                updateTask={updateTask}
                            />
                        )}
                        {activeTask && (
                            <TaskCard task={activeTask} deleteTask={deleteTask} updateTask={updateTask} />
                        )}
                    </DragOverlay>,
                    document.body
                )}
            </DndContext>
        </div>
    );
}

export default KanbanBoard;
