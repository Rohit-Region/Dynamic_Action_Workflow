import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import "./styles.css";

const actionTypes = [
  "Alert",
  "Show Text",
  "Show Image",
  "Refresh Page",
  "Set LocalStorage",
  "Get LocalStorage",
  "Increase Button Size",
  "Close Window",
  "Prompt and Show",
  "Change Button Color",
  "Disable Button"
];

const SortableItem = ({ action, index, updateAction, removeAction }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: action.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px",
    marginBottom: "8px",
    backgroundColor: "var(--card-bg)",
    borderRadius: "8px",
    cursor: "grab",
    border: "1px solid var(--border-color)",
    boxShadow: "2px 2px 8px var(--shadow-color)"
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
          <span style={{ cursor: "grab", userSelect: "none", marginRight: "8px" }}>
    ☰
  </span>

      <select
        className="styled-dropdown"
        value={action.type}
        onChange={(e) => updateAction(index, "type", e.target.value)}
      >
        
        {actionTypes.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
      {action.type === "Set LocalStorage" ? (
  <>
    <input
      className="styled-input small-input"
      type="text"
      placeholder="Enter key"
      value={action.key || ""}
      onChange={(e) => updateAction(index, "key", e.target.value)}
      onPointerDown={(e) => e.stopPropagation()}
    />
    <input
      className="styled-input"
      type="text"
      placeholder="Enter value"
      value={action.value || ""}
      onChange={(e) => updateAction(index, "value", e.target.value)}
      onPointerDown={(e) => e.stopPropagation()}
    />
  </>
) : action.type === "Get LocalStorage" ? (
  <input
    className="styled-input"
    type="text"
    placeholder="Enter key"
    value={action.key || ""}
    onChange={(e) => updateAction(index, "key", e.target.value)}
    onPointerDown={(e) => e.stopPropagation()}
  />
) : ["Alert", "Show Text", "Show Image","Change Button Color"].includes(action.type) ? (
  <input
    className="styled-input"
    type="text"
    placeholder="Enter value"
    value={action.value || ""}
    onChange={(e) => updateAction(index, "value", e.target.value)}
    onPointerDown={(e) => e.stopPropagation()}
  />
) : null}

      <button
        className="remove-button"
        onClick={(e) => {
          e.stopPropagation();
          removeAction(index);
        }}
      >
        DELETE
      </button>
    </div>
  );
};

const ConfigPage = ({ setConfig }) => {
  const [label, setLabel] = useState("Click Me");
  const [workflow, setWorkflow] = useState([]);
  const [selectedActionType, setSelectedActionType] = useState(""); // New state for dropdown selection
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");

  const previewWorkflow = () => {
    if (workflow.length === 0) {
      setModalContent("No actions in the workflow.");
    } else {
      setModalContent(
        workflow
          .map((action, index) => `${index + 1}. ${action.type} - ${action.value || action.key || `NA`}`)
          .join("\n")
      );
    }
    setIsModalOpen(true);
  };
  useEffect(() => {
    const savedConfig = JSON.parse(localStorage.getItem("buttonConfig"));
    if (savedConfig) {
      setLabel(savedConfig.label);
      setWorkflow(
        savedConfig.workflow.map((item, i) => ({ ...item, id: `action-${i}` }))
      );
    }
  }, []);

  const addAction = () => {
    if (!selectedActionType) return;

    setWorkflow([
      ...workflow,
      { id: `action-${Date.now()}`, type: selectedActionType, value: "" }
    ]);
    setSelectedActionType(""); 
  };

  const updateAction = (index, key, value) => {
    const updatedWorkflow = [...workflow];
    updatedWorkflow[index][key] = value;
    setWorkflow(updatedWorkflow);
  };

  const removeAction = (index) => {
    setWorkflow((prev) => prev.filter((_, i) => i !== index));
  };

  const clearWorkflow = () => {
    setWorkflow([]);
    localStorage.removeItem("buttonConfig");
  };


  const saveConfig = () => {
    const newConfig = { label, workflow };
    localStorage.setItem("buttonConfig", JSON.stringify(newConfig));
    setConfig(newConfig);
    navigate("/output");
  };

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  const onDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = workflow.findIndex((item) => item.id === active.id);
      const newIndex = workflow.findIndex((item) => item.id === over.id);
      const reorderedWorkflow = [...workflow];
      const [movedItem] = reorderedWorkflow.splice(oldIndex, 1);
      reorderedWorkflow.splice(newIndex, 0, movedItem);
      setWorkflow(reorderedWorkflow);
    }
  };

  return (
    <div className="config-container">
      <h1>Configure Button</h1>

      <div className="action-selection">
        <select
          className="styled-dropdown"
          value={selectedActionType}
          onChange={(e) => setSelectedActionType(e.target.value)}
        >
          <option value="">Select Action Type</option>
          {actionTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <button
          className="add-button"
          onClick={addAction}
          disabled={!selectedActionType} 
          style={{ marginLeft: "20px" }}
        >
          Add Action
        </button>
        <button   className="add-button"   style={{ marginLeft: "20px" }} onClick={clearWorkflow}>Clear Workflow</button>  
      </div>
        
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={workflow} strategy={verticalListSortingStrategy}>
          <div className="sortable-list">
            {workflow.map((action, index) => (
              <SortableItem
                key={action.id}
                action={action}
                index={index}
                updateAction={updateAction}
                removeAction={removeAction}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {workflow.length > 0 && (
  <div className="button-group">
    <button className="preview-button" onClick={previewWorkflow}>
      Preview Workflow
    </button>
    <button className="save-button" onClick={saveConfig}>
       Go to Output Page
    </button>
  </div>
)}
      <div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Workflow Preview</h3>
            <pre>{modalContent}</pre>
            <button onClick={() => setIsModalOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default ConfigPage;
