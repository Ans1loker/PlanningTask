import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { List, ListItem, ListItemText, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const TaskList = ({ tasks, onEdit, onDelete, onSort }) => {
  return (
    <List>
      {tasks.map((task, index) => (
        <Draggable key={task._id.toString()} draggableId={task._id.toString()} index={index}>
          {(provided) => (
            <ListItem
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              secondaryAction={
                <div>
                  <IconButton edge="end" aria-label="edit" onClick={() => onEdit(task)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" aria-label="delete" onClick={() => onDelete(task._id)}>
                    <DeleteIcon />
                  </IconButton>
                </div>
              }
            >
              <ListItemText
                primary={task.name}
                secondary={`Priority: ${task.priority} | Status: ${task.status} | Progress: ${task.progress}%`}
              />
            </ListItem>
          )}
        </Draggable>
      ))}
    </List>
  );
};

export default TaskList;
