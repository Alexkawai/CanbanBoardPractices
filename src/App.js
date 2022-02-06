import React, { PureComponent, useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const updateItem = (issue_number, state) => {
  fetch(`https://api.github.com/repos/Alexkawai/CanbanBoardPractices/issues/${issue_number}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Basic ${btoa('Alexkawai' + ':' + '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')}`
    },
    body: JSON.stringify({
      "owner": 'Alexkawai',
      "repo": 'CanbanBoardPractices',
      "issue_number": issue_number,
      "state": state
    })
})
};

const loadItem = (setColumns) => {
  fetch('https://api.github.com/repos/Alexkawai/CanbanBoardPractices/issues')
    .then((response) => response.json())
    .then((data) =>
      data.map((item) => ({
        id: `${item.number}`,
        content: item.title,
        data,
        state: item.state,
      }))
    )
    .then((data) => {
      const columns = {
        open: {
          name: 'Open',
          items: [],
        },
        close: {
          name: 'Close',
          items: [],
        },
      };
      for (let key of data
        .map((el) => el.state)
        .filter((value, index, array) => array.indexOf(value) === index)) {
        columns[key] = {
          name: key,
          items: data.filter((el) => el.state === key),
        };
      }

      // console.log(columns);
      return columns;
    })
    .then((data) => setColumns(data));
};

// fake data generator for replace to map data  from GET https://api.github.com/repos/{owner}/{repo}/issues
const getItems = (count) =>
  Array.from({ length: count }, (v, k) => k).map((k) => ({
    id: `item-${k}`,
    content: `item ${k}`,
  }));

const columnsFromBackend = {
  open: {
    name: 'Open',
    items: getItems(10),
  },

  close: {
    name: 'Close',
    items: [],
  },
};

const onDragEnd = (result, columns, setColumns) => {
  if (!result.destination) return;
  const { source, destination } = result;
  
  if (source.droppableId !== destination.droppableId) {
    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    const sourceItems = [...sourceColumn.items];
    const destItems = [...destColumn.items];
    const [removed] = sourceItems.splice(source.index, 1);
    destItems.splice(destination.index, 0, removed);
    setColumns({
      ...columns,
      [source.droppableId]: {
        ...sourceColumn,
        items: sourceItems,
      },
      [destination.droppableId]: {
        ...destColumn,
        items: destItems,
      },
    });
  } else {
    const column = columns[source.droppableId];
    const copiedItems = [...column.items];
    const [removed] = copiedItems.splice(source.index, 1);
    copiedItems.splice(destination.index, 0, removed);
    setColumns({
      ...columns,
      [source.droppableId]: {
        ...column,
        items: copiedItems,
      },
    });
  }
  console.log(result,columns)
};

export default function App() {
  const [columns, setColumns] = useState(columnsFromBackend);
  useEffect(() => {
    loadItem(setColumns)
  },[]);
  return (
    <div style={{ display: 'flex', justifyContent: 'center', height: '100%' }}>
      <DragDropContext
        onDragEnd={(result) => onDragEnd(result, columns, setColumns)}
      >
        {Object.entries(columns).map(([columnId, column], index) => {
          return (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
              key={columnId}
            >
              <h2>{column.name}</h2>
              <div style={{ margin: 8 }}>
                <Droppable droppableId={columnId} key={columnId}>
                  {(provided, snapshot) => {
                    return (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        style={{
                          background: snapshot.isDraggingOver
                            ? 'lightblue'
                            : 'lightgrey',
                          padding: 4,
                          width: 250,
                          minHeight: 500,
                        }}
                      >
                        {column.items.map((item, index) => {
                          return (
                            <Draggable
                              key={item.id}
                              draggableId={item.id}
                              index={index}
                            >
                              {(provided, snapshot) => {
                                return (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={{
                                      userSelect: 'none',
                                      padding: 16,
                                      margin: '0 0 8px 0',
                                      minHeight: '50px',
                                      backgroundColor: snapshot.isDragging
                                        ? '#263B4A'
                                        : '#456C86',
                                      color: 'white',
                                      ...provided.draggableProps.style,
                                    }}
                                  >
                                    {item.content}
                                  </div>
                                );
                              }}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    );
                  }}
                </Droppable>
              </div>
            </div>
          );
        })}
      </DragDropContext>
    </div>
  );
}
