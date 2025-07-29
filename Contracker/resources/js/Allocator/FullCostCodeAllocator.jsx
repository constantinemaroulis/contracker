// Adapted version of the CodePen allocator for use with React/Vite
import React, { useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

function AssignmentCard({ assignment, meta, onRemove }) {
    return (
        <div className="bg-white rounded shadow p-2 mb-2 flex justify-between">
            <div>
                <h4 className="font-semibold text-sm">{meta.name}</h4>
                <p className="text-xs text-gray-500">{meta.local}</p>
            </div>
            <button onClick={() => onRemove(assignment.id)} className="text-red-500">Remove</button>
        </div>
    );
}

export default function FullCostCodeAllocator({ costCodes, laborers, assignments: initialAssignments }) {
    const [assignments, setAssignments] = useState(initialAssignments || []);
    const assignedLaborerIds = useMemo(() => new Set(assignments.map(a => a.laborerId)), [assignments]);

    const unassignedByLocal = useMemo(() => {
        const map = {};
        laborers.forEach(l => {
            if (!assignedLaborerIds.has(l.id)) {
                if (!map[l.local]) map[l.local] = [];
                map[l.local].push(l);
            }
        });
        return map;
    }, [laborers, assignedLaborerIds]);

    const onDragEnd = ({ destination, source, draggableId }) => {
        if (!destination) return;
        const [type, id] = draggableId.split(':');
        if (type === 'lab') {
            const targetCostCodeId = destination.droppableId;
            if (!targetCostCodeId.startsWith('costcode-')) return;
            const laborer = laborers.find(l => l.id === id);
            if (laborer && !assignedLaborerIds.has(laborer.id)) {
                setAssignments(prev => [...prev, { id: Date.now().toString(), laborerId: laborer.id, costCodeId: targetCostCodeId, hours: laborer.original_hours }]);
            }
        }
    };

    const handleRemove = (id) => {
        setAssignments(prev => prev.filter(a => a.id !== id));
    };

    return (
        <div className="flex gap-4">
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="w-1/3 p-2 bg-gray-200 rounded overflow-y-auto" style={{ maxHeight: '80vh' }}>
                    {Object.entries(unassignedByLocal).map(([loc, labs]) => (
                        <div key={loc} className="mb-4">
                            <h3 className="font-medium text-sm mb-2">{loc}</h3>
                            {labs.map((l, index) => (
                                <Draggable key={l.id} draggableId={`lab:${l.id}`} index={index}>
                                    {(prov) => (
                                        <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} className="bg-white rounded p-2 mb-2 shadow">
                                            {l.name}
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                        </div>
                    ))}
                </div>
                <div className="flex-1 overflow-y-auto p-2" style={{ maxHeight: '80vh' }}>
                    {costCodes.map(cc => (
                        <div key={cc.id} className="mb-4 bg-gray-50 p-2 rounded border">
                            <h3 className="font-semibold text-sm mb-2">{cc.code} - {cc.name}</h3>
                            <Droppable droppableId={cc.id}>
                                {(provided) => (
                                    <div ref={provided.innerRef} {...provided.droppableProps} className="min-h-[40px]">
                                        {assignments.filter(a => a.costCodeId === cc.id).map((a, idx) => {
                                            const m = laborers.find(l => l.id === a.laborerId);
                                            if (!m) return null;
                                            return (
                                                <Draggable key={a.id} draggableId={`assign:${a.id}`} index={idx}>
                                                    {(prov) => (
                                                        <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}>
                                                            <AssignmentCard assignment={a} meta={m} onRemove={handleRemove} />
                                                        </div>
                                                    )}
                                                </Draggable>
                                            );
                                        })}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))}
                </div>
            </DragDropContext>
        </div>
    );
}
