import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import '../../css/allocator.css';

function Allocator({ costCodes, laborers, assignments }) {
  const [state, setState] = useState({ costCodes, laborers, assignments });

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (destination.droppableId.startsWith('laborer-')) {
      const laborerId = parseInt(destination.droppableId.replace('laborer-', ''), 10);
      setState(prev => ({
        ...prev,
        assignments: [...prev.assignments, { laborer_id: laborerId, cost_code_id: parseInt(draggableId, 10), hours: 0 }],
      }));
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="allocator-container">
        <Droppable droppableId="costCodes">
          {(provided) => (
            <div className="cost-codes" ref={provided.innerRef} {...provided.droppableProps}>
              {state.costCodes.map((cc, index) => (
                <Draggable key={cc.id} draggableId={String(cc.id)} index={index}>
                  {(prov) => (
                    <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} className="cost-code">
                      {cc.code} - {cc.name}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
        <div className="laborers">
          {state.laborers.map(lab => (
            <Droppable droppableId={`laborer-${lab.id}`} key={lab.id}>
              {(provided) => (
                <div className="laborer" ref={provided.innerRef} {...provided.droppableProps}>
                  <h3>{lab.name}</h3>
                  <ul>
                    {state.assignments.filter(a => a.laborer_id === lab.id).map(a => {
                      const cc = state.costCodes.find(c => c.id === a.cost_code_id);
                      return <li key={`${a.laborer_id}-${a.cost_code_id}`}>{cc ? cc.code : a.cost_code_id}</li>;
                    })}
                    {provided.placeholder}
                  </ul>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </div>
    </DragDropContext>
  );
}

export default function mount(el, data) {
  const root = createRoot(el);
  root.render(<Allocator {...data} />);
}

