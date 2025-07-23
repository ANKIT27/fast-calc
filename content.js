let firstNumber = null;
let popup = null;

/**
 * Handle text selection on mouseup.
 * If a number is selected, either fill first or second input.
 */
document.addEventListener("mouseup", (e) => {
  // Don't trigger on popup interactions
  if (popup && popup.contains(e.target)) return;

  const rawSelection = window.getSelection().toString().trim();
  const cleanSelection = rawSelection.replace(/[^0-9.\-]/g, '');

  if (!isNaN(cleanSelection) && cleanSelection !== "") {
    const selectedNumber = parseFloat(cleanSelection);

    if (firstNumber === null) {
      firstNumber = selectedNumber;
      createPopup(e, firstNumber);
    } else {
      const secondInput = document.getElementById("secondNum");
      if (secondInput) {
        secondInput.value = selectedNumber;
      }
    }
  }
});

/**
 * Creates the draggable popup with inputs, dropdown, result, and buttons.
 */
function createPopup(e, num) {
  // Remove existing popup
  const old = document.getElementById("fast-calc-popup");
  if (old) old.remove();

  popup = document.createElement("div");
  popup.id = "fast-calc-popup";
  popup.style = `
    position: fixed;
    top: ${e.clientY + 10}px;
    left: ${e.clientX + 10}px;
    z-index: 99999;
    opacity: 0.9;
    font-family: sans-serif;
    background: white;
    box-shadow: 0 0 10px rgba(0,0,0,0.2);
    border-radius: 5px;
    min-width: 200px;
  `;

  popup.innerHTML = `
    <div id="popup-header" style="
      background:#eee;
      padding:9px;
      cursor:move;
      display:flex;
      justify-content:space-between;
      align-items:center;
      font-weight:bold;
      border-bottom:2px solid #ccc;
    ">
      <span>Fast Calc</span>
      <span id="closePopup" style="cursor:pointer;font-size:18px;">&times;</span>
    </div>
    <div style="padding:9px;">
      <div>X: <input type="text" id="firstNum" placeholder="select or type" value="${num}" style="width: 90px;" /></div>
      <div>Y: <input type="text" id="secondNum" placeholder="select or type" style="width: 90px;" /></div>

      <select id="op" style="
        margin-top:9px;
        padding:6px 9px;
        font-size:15px;
        width:auto;
        min-width:60px;
        max-width:100%;
      ">
        <option value="">Select op</option>
        <option value="+">+</option>
        <option value="-">−</option>
        <option value="*">×</option>
        <option value="/">÷</option>
        <option value="%">%</option>
      </select>

      <div id="res" style="margin-top:9px;font-weight:bold;"></div>
      <button id="clearFields" style="margin-top:10px;">Clear</button>
    </div>
  `;

  document.body.appendChild(popup);

  attachOpHandler();       // Attach calculation logic to dropdown
  enableDragging();        // Allow popup to be moved
  attachUtilityHandlers(); // Attach close and clear logic
}

/**
 * Evaluates the result when an operation is selected.
 */
function attachOpHandler() {
  const op = document.getElementById("op");
  const res = document.getElementById("res");

  op.onchange = () => {
    const firstVal = parseFloat(document.getElementById("firstNum").value.replace(/,/g, ''));
    const secondVal = parseFloat(document.getElementById("secondNum").value.replace(/,/g, ''));
    const operator = op.value;

    if (!operator || isNaN(firstVal) || isNaN(secondVal)) {
      res.innerText = "Invalid input.";
      return;
    }

    let result;
    switch (operator) {
      case "+": result = firstVal + secondVal; break;
      case "-": result = firstVal - secondVal; break;
      case "*": result = firstVal * secondVal; break;
      case "/": result = secondVal !== 0 ? (firstVal / secondVal).toFixed(2) : "∞"; break;
      case "%": result = (firstVal * secondVal) / 100; break;
    }

    res.innerText = "=: " + result;
  };
}

/**
 * Enables click-and-drag functionality on the popup.
 */
function enableDragging() {
  const dragHandle = document.getElementById("popup-header");
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  dragHandle.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - popup.offsetLeft;
    offsetY = e.clientY - popup.offsetTop;
    document.body.style.userSelect = "none";
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      popup.style.left = `${e.clientX - offsetX}px`;
      popup.style.top = `${e.clientY - offsetY}px`;
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    document.body.style.userSelect = "auto";
  });
}

/**
 * Adds ESC key close and Clear button functionality.
 */
function attachUtilityHandlers() {
  // ESC to close popup
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && popup) {
      popup.remove();
      popup = null;
      firstNumber = null;
    }
  });

  // Clear button functionality
  document.getElementById("clearFields").onclick = () => {
    firstNumber = null;
    document.getElementById("firstNum").value = "";
    document.getElementById("secondNum").value = "";
    document.getElementById("res").innerText = "";
    document.getElementById("op").value = "";
  };

  // Close (X) icon
  document.getElementById("closePopup").onclick = () => {
    popup.remove();
    popup = null;
    firstNumber = null;
  };
}

// On extension reload, ensure previous popup is cleaned
const existingPopup = document.getElementById("fast-calc-popup");
if (existingPopup) {
  existingPopup.remove();
  firstNumber = null;
  popup = null;
}
