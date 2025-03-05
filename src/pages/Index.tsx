
import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Plus, MoreHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

// Initial data for the kanban board
const initialData = {
  tasks: {
    'task-1': { id: 'task-1', content: 'Take out the garbage' },
    'task-2': { id: 'task-2', content: 'Watch my favorite show' },
    'task-3': { id: 'task-3', content: 'Charge my phone' },
    'task-4': { id: 'task-4', content: 'Cook dinner' },
    'task-5': { id: 'task-5', content: 'Complete project proposal' },
    'task-6': { id: 'task-6', content: 'Schedule team meeting' },
  },
  columns: {
    'column-1': {
      id: 'column-1',
      title: 'To do',
      taskIds: ['task-1', 'task-2', 'task-3'],
    },
    'column-2': {
      id: 'column-2',
      title: 'In progress',
      taskIds: ['task-4', 'task-5'],
    },
    'column-3': {
      id: 'column-3',
      title: 'Done',
      taskIds: ['task-6'],
    },
  },
  columnOrder: ['column-1', 'column-2', 'column-3'],
};

const Index = () => {
  const [data, setData] = useState(initialData);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [addingColumn, setAddingColumn] = useState(false);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [newTaskContent, setNewTaskContent] = useState("");
  const [addingTaskToColumn, setAddingTaskToColumn] = useState<string | null>(null);

  const onDragEnd = (result) => {
    const { destination, source, draggableId, type } = result;

    // If there's no destination or if the item was dropped in the same position
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    // If we're dragging columns
    if (type === 'column') {
      const newColumnOrder = Array.from(data.columnOrder);
      newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, draggableId);

      setData({
        ...data,
        columnOrder: newColumnOrder,
      });
      return;
    }

    // Moving tasks
    const sourceColumn = data.columns[source.droppableId];
    const destinationColumn = data.columns[destination.droppableId];

    // If moving within the same column
    if (sourceColumn === destinationColumn) {
      const newTaskIds = Array.from(sourceColumn.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...sourceColumn,
        taskIds: newTaskIds,
      };

      setData({
        ...data,
        columns: {
          ...data.columns,
          [newColumn.id]: newColumn,
        },
      });
      return;
    }

    // Moving from one column to another
    const sourceTaskIds = Array.from(sourceColumn.taskIds);
    sourceTaskIds.splice(source.index, 1);
    const newSourceColumn = {
      ...sourceColumn,
      taskIds: sourceTaskIds,
    };

    const destinationTaskIds = Array.from(destinationColumn.taskIds);
    destinationTaskIds.splice(destination.index, 0, draggableId);
    const newDestinationColumn = {
      ...destinationColumn,
      taskIds: destinationTaskIds,
    };

    setData({
      ...data,
      columns: {
        ...data.columns,
        [newSourceColumn.id]: newSourceColumn,
        [newDestinationColumn.id]: newDestinationColumn,
      },
    });
  };

  const addNewColumn = () => {
    if (!newColumnTitle.trim()) return;
    
    const newColumnId = `column-${Date.now()}`;
    const newColumn = {
      id: newColumnId,
      title: newColumnTitle,
      taskIds: [],
    };

    setData({
      ...data,
      columns: {
        ...data.columns,
        [newColumnId]: newColumn,
      },
      columnOrder: [...data.columnOrder, newColumnId],
    });

    setNewColumnTitle("");
    setAddingColumn(false);
  };

  const addNewTask = (columnId) => {
    if (!newTaskContent.trim()) return;
    
    const newTaskId = `task-${Date.now()}`;
    const newTask = {
      id: newTaskId,
      content: newTaskContent,
    };

    const column = data.columns[columnId];
    const newTaskIds = Array.from(column.taskIds);
    newTaskIds.push(newTaskId);

    setData({
      ...data,
      tasks: {
        ...data.tasks,
        [newTaskId]: newTask,
      },
      columns: {
        ...data.columns,
        [columnId]: {
          ...column,
          taskIds: newTaskIds,
        },
      },
    });

    setNewTaskContent("");
    setAddingTaskToColumn(null);
  };

  const deleteTask = (taskId, columnId) => {
    const column = data.columns[columnId];
    const newTaskIds = column.taskIds.filter(id => id !== taskId);
    
    const newTasks = { ...data.tasks };
    delete newTasks[taskId];

    setData({
      ...data,
      tasks: newTasks,
      columns: {
        ...data.columns,
        [columnId]: {
          ...column,
          taskIds: newTaskIds,
        },
      },
    });
  };

  const deleteColumn = (columnId) => {
    // Get all tasks from this column
    const column = data.columns[columnId];
    const taskIdsToDelete = column.taskIds;
    
    // Create new tasks object without the deleted tasks
    const newTasks = { ...data.tasks };
    taskIdsToDelete.forEach(taskId => {
      delete newTasks[taskId];
    });
    
    // Create new columns object without the deleted column
    const newColumns = { ...data.columns };
    delete newColumns[columnId];
    
    // Create new columnOrder without the deleted column
    const newColumnOrder = data.columnOrder.filter(id => id !== columnId);
    
    setData({
      tasks: newTasks,
      columns: newColumns,
      columnOrder: newColumnOrder,
    });
  };

  return (
    <div className="min-h-screen bg-[#fafafa] p-4 md:p-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Kanban Board</h1>
          <p className="text-sm text-gray-600">Drag and drop tasks between columns</p>
        </div>
        <div className="flex gap-2">
          <Link to="/docs">
            <Button variant="outline">Documentation</Button>
          </Link>
        </div>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="all-columns" direction="horizontal" type="column">
          {(provided) => (
            <div 
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex gap-4 overflow-x-auto pb-4"
            >
              {data.columnOrder.map((columnId, index) => {
                const column = data.columns[columnId];
                const tasks = column.taskIds.map(taskId => data.tasks[taskId]);
                
                return (
                  <Draggable key={column.id} draggableId={column.id} index={index}>
                    {(provided) => (
                      <div
                        {...provided.draggableProps}
                        ref={provided.innerRef}
                        className="w-72 flex-shrink-0"
                      >
                        <div className="rounded-md bg-white shadow-sm">
                          <div 
                            {...provided.dragHandleProps}
                            className="flex items-center justify-between rounded-t-md border-b bg-gray-50 p-3"
                          >
                            <h2 className="font-medium text-gray-700">{column.title}</h2>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => deleteColumn(column.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <Droppable droppableId={column.id} type="task">
                            {(provided, snapshot) => (
                              <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className={`min-h-[100px] p-2 ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}`}
                              >
                                {tasks.map((task, index) => (
                                  <Draggable key={task.id} draggableId={task.id} index={index}>
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={`mb-2 rounded-md border bg-white p-3 shadow-sm ${
                                          snapshot.isDragging ? 'bg-blue-50 shadow-md' : ''
                                        }`}
                                      >
                                        {editingTask === task.id ? (
                                          <div className="flex flex-col gap-2">
                                            <Input
                                              value={newTaskContent}
                                              onChange={(e) => setNewTaskContent(e.target.value)}
                                              autoFocus
                                            />
                                            <div className="flex gap-2">
                                              <Button 
                                                size="sm" 
                                                onClick={() => {
                                                  if (newTaskContent.trim()) {
                                                    setData({
                                                      ...data,
                                                      tasks: {
                                                        ...data.tasks,
                                                        [task.id]: {
                                                          ...task,
                                                          content: newTaskContent,
                                                        },
                                                      },
                                                    });
                                                  }
                                                  setEditingTask(null);
                                                }}
                                              >
                                                Save
                                              </Button>
                                              <Button 
                                                variant="outline" 
                                                size="sm" 
                                                onClick={() => {
                                                  setEditingTask(null);
                                                  setNewTaskContent("");
                                                }}
                                              >
                                                Cancel
                                              </Button>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="flex items-start justify-between">
                                            <p className="text-sm text-gray-700">{task.content}</p>
                                            <div className="flex gap-1">
                                              <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="h-6 w-6 p-0"
                                                onClick={() => {
                                                  setEditingTask(task.id);
                                                  setNewTaskContent(task.content);
                                                }}
                                              >
                                                <MoreHorizontal className="h-3 w-3" />
                                              </Button>
                                              <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="h-6 w-6 p-0 text-red-500"
                                                onClick={() => deleteTask(task.id, column.id)}
                                              >
                                                <X className="h-3 w-3" />
                                              </Button>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                                
                                {addingTaskToColumn === column.id ? (
                                  <div className="mt-2 flex flex-col gap-2 p-2">
                                    <Input
                                      placeholder="Enter task content..."
                                      value={newTaskContent}
                                      onChange={(e) => setNewTaskContent(e.target.value)}
                                      autoFocus
                                    />
                                    <div className="flex gap-2">
                                      <Button 
                                        size="sm" 
                                        onClick={() => addNewTask(column.id)}
                                      >
                                        Add
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => {
                                          setAddingTaskToColumn(null);
                                          setNewTaskContent("");
                                        }}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="mt-2 w-full justify-start text-gray-500"
                                    onClick={() => setAddingTaskToColumn(column.id)}
                                  >
                                    <Plus className="mr-1 h-4 w-4" /> Add a task
                                  </Button>
                                )}
                              </div>
                            )}
                          </Droppable>
                        </div>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
              
              {addingColumn ? (
                <div className="w-72 flex-shrink-0">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-2">
                        <Input
                          placeholder="Enter column title..."
                          value={newColumnTitle}
                          onChange={(e) => setNewColumnTitle(e.target.value)}
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button onClick={addNewColumn}>Add Column</Button>
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setAddingColumn(false);
                              setNewColumnTitle("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="h-auto w-72 flex-shrink-0 justify-start p-3 text-gray-500"
                  onClick={() => setAddingColumn(true)}
                >
                  <Plus className="mr-1 h-4 w-4" /> Add another column
                </Button>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default Index;
