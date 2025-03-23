import React, { useState, useEffect } from "react";
import "./outputstyles.css";
import { useNavigate } from "react-router-dom";
const OutputPage = ({ config }) => {
  const [buttonSize, setButtonSize] = useState(1);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [buttonColor, setButtonColor] = useState("#007bff");
  const [output, setOutput] = useState("");
  const navigate = useNavigate()
  useEffect(() => {
  
    const savedConfig = JSON.parse(localStorage.getItem("buttonConfig"));
    if (savedConfig) {
      config = savedConfig;
    }
  }, []);

  const executeWorkflow = async () => {
    for (const action of config.workflow) {
      await executeAction(action);
    }
  };
  
  const executeAction = (action) => {
    return new Promise((resolve) => {
        switch (action.type) {
            case "Alert":
                alert(action.value);
                resolve();
                break;

            case "Show Text":
                setOutput(action.value);
                setTimeout(resolve, 2000); 
                break;

            case "Show Image":
                    console.log("__", action.value);
                    const imageUrl = action.value?.trim() || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmpT6rscUaqC6IK1x48k9GU-Av3fgKo0lPgg&s";                    
                    const closeModal = () => {
                        setOutput("");
                        resolve(); 
                    };
                
                    setOutput(
                        <div style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            width: "100vw",
                            height: "100vh",
                            backgroundColor: "rgba(0, 0, 0, 0.8)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 1000
                        }}>
                            <button 
                                onClick={closeModal} 
                                style={{
                                    position: "absolute",
                                    top: "15px",
                                    right: "20px",
                                    background: "red",
                                    color: "white",
                                    border: "none",
                                    padding: "8px 12px",
                                    fontSize: "16px",
                                    cursor: "pointer",
                                    borderRadius: "5px",
                                    zIndex: 1001
                                }}
                            >
                                ✖
                            </button>
                
                           
                            <img src={imageUrl} alt="User Defined" style={{
                                maxWidth: "90vw", 
                                maxHeight: "90vh",
                                borderRadius: "8px",
                                boxShadow: "0px 4px 10px rgba(255, 255, 255, 0.3)"
                            }} />
                        </div>
                    );
                
                  
                    setTimeout(closeModal, 2000);
                    break;

            case "Refresh Page":
                window.location.reload();
                return; 

            case "Set LocalStorage":
                console.log("Storing Key:", action.key, "Value:", action.value); 
                if (action.key && action.value) {
                    localStorage.setItem(action.key.trim(), action.value.trim());
                }
                resolve();
                break;

            case "Get LocalStorage":
                console.log("Retrieving Key:", action.key); 
                const storedValue = localStorage.getItem(action.key.trim()); 
                console.log("Stored Value:", storedValue);
                setOutput(storedValue ? `Stored Value: ${storedValue}` : "Key not found");
                setTimeout(resolve, 2000); 
                break;

            case "Increase Button Size":
                setButtonSize((size) => size + (parseFloat(action.value) || 0.2));
                resolve();
                break;

            case "Close Window":
                if (window.opener) {
                    window.close();
                } else {
                    alert("Cannot close this window, Because of Permission Issue");
                }
                break;
            case "Prompt and Show":
                const response = prompt(action.value);
                setOutput(response);
                setTimeout(resolve, 2000);
                break;

            case "Change Button Color":
                setButtonColor(action.value || `#${Math.floor(Math.random() * 16777215).toString(16)}`);
                resolve();
                break;

            case "Disable Button":
                setButtonDisabled(true);
                setButtonColor("Grey")
                resolve();
                break;

            default:
                resolve();
                break;

                
        }

        
    });
};

  return (
    <div >
      <h1>Output Page</h1>
      <button
        id="dynamic-button"
        onClick={executeWorkflow}
        style={{ transform: `scale(${buttonSize})`, backgroundColor: buttonColor }}
        disabled={buttonDisabled}
      >
        {config.label}
      </button>
      <button 
  className="add-button" 
  onClick={() => navigate('/')} 
  style={{ marginLeft: "20px" }} 
>
  Edit Existing Workflow
</button>
      <div>{output}</div>
    </div>
  );
};

export default OutputPage;