import { SortableContext, useSortable } from "@dnd-kit/sortable";
import DeleteIcon from "../icons/DeleteIcon";
import { Column, Id, Task } from "../types";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
import PlusIconRounded from "../icons/PlusIconRounded";
import TaskCard from "./TaskCard";
interface Props {
    column: Column;
    deleteColumn: (id: Id) => void;
    updateColumn: (id: Id, title: string) => void;
    tasks: Task[];
    createTask: (columnId: Id) => void;
    updateTask: (id: Id, content: string) => void;
    deleteTask: (id: Id) => void;
}

function ColumnContainer({
    column,
    deleteColumn,
    updateColumn,
    createTask,
    tasks,
    deleteTask,
    updateTask,
}: Props) {
    const [editMode, setEditMode] = useState(false);


    const tasksIds = useMemo(() => { return tasks.map((task) => task.id) }, [tasks]);


    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: column.id,
        data: {
            type: "Column",
            column,
        },
        disabled: editMode, //editmode true ise tasıma yapamaz
    });
    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    };
    /*eger sürükleceksek yerini görmek için*/
    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="
        bg-columnBackgroundColor 
        w-[350px]
        h-[500px]
        max-h-[500px]
        rounded-md 
        flex 
        flex-col
        opacity-20
        border-2
        border-b-sky-400
        "
            ></div>
        );
    }
    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-columnBackgroundColor w-[350px] h-[500px] max-h-[500px] rounded-md flex flex-col"
        >
            {/*Column title*/}
            <div
                onClick={() => setEditMode(true)}
                {...attributes}
                {...listeners}
                className="flex item-center justify-between bg-mainBackgroundColor text-md h-[60px] cursor-grab rounded-md rounded-b-none p-3 font-bold border-columnBackgroundColor border-4"
            >
                <div className="flex gap-2">
                    <div className="flex justify-center items-center bg-columnBackgroundColor px-2 py-1 text-sm rounded-full">
                        0
                    </div>
                    {!editMode && column.title}
                    {editMode && (
                        <input
                            className="bg-black focus:border-sky-400 border rounded outline-none px-2"
                            value={column.title}
                            onChange={(e) => updateColumn(column.id, e.target.value)}
                            autoFocus
                            onBlur={() => setEditMode(false)}
                            onKeyDown={(e) => {
                                if (e.key !== "Enter") return;
                                setEditMode(false);
                            }}
                        />
                    )}
                </div>
                <button
                    onClick={() => {
                        deleteColumn(column.id);
                    }}
                    className="stroke-red-600 hover:stroke-white hover:bg-mainBackgroundColor rounded"
                >
                    <DeleteIcon />
                </button>
            </div>

            {/*column Task container*/}
            <div className="flex flex-grow flex-col gap-5 p-3 overflow-x-hidden overflow-y-auto">
                <SortableContext items={tasksIds}>
                    {tasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            deleteTask={deleteTask}
                            updateTask={updateTask}
                        />
                    ))}
                </SortableContext>
            </div>
            {/*column footer*/}
            <button
                className="
            flex
            gap-2
            items-center 
            justify-center 
            border-2 
            rounded-md 
            p-4
            border-columnBackgroundColor
            border-x-columnBackgroundColor 
            hover:bg-mainBackgroundColor hover:text-sky-400
            active:bg-black"
                onClick={() => {
                    createTask(column.id); //bu column için task olustur
                }}
            >
                <PlusIconRounded />
                Add Task
            </button>
        </div>
    );
}

export default ColumnContainer;
