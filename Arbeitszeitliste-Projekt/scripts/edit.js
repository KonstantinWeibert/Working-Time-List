import { timeList, renderTime, addId, saveToStorage, calculateDuration, hourlyWage } from "./script.js";
import { getWage } from "./settings.js";

let edit = false;

export function editButton() {
  document.querySelectorAll('.js-edit-button')
      .forEach((editButton) => {
        editButton.addEventListener('click', () => {
          const selectedId = parseInt(editButton.dataset.editId);
          const entry = timeList.find(entry => entry.id === selectedId);
          const dateInput = document.querySelector(`.js-date-${selectedId}`);
          const periodOfTimeInput = document.querySelector(`.js-period-of-time-${selectedId}`);

          if (entry && !edit ) {
            editEntry(entry, editButton, dateInput, periodOfTimeInput);
          } 
            else if (entry && edit) {
              saveEntry(entry, editButton, dateInput, periodOfTimeInput)
          }
            else {
              console.error('Entry not found');  
        }});
  });
}


function editEntry(entry, editButton, dateInput, periodOfTimeInput) {
  const { date, begin, end } = updateEditStateAndStyle(editButton, entry);

  document.querySelectorAll('.js-edit-button')
      .forEach((editButton) => {
        if (editButton.innerText === "Bearbeiten") {
          editButton.disabled = true;
        }
      });
  
  document.querySelectorAll('.js-remove-button')
      .forEach((removeButton) => {
        if (edit) {
          removeButton.disabled = true;
        }
      });

  dateInput.innerHTML = `
    <input
    type="text"
    value="${date}"
    class="edit-date-input js-edit-date-input"
    maxlength="10"
    minlength="10"
    />
  `;
 
  periodOfTimeInput.innerHTML = `Von 
    <input
    type="text"
    value="${begin}"
    class="edit-time-input js-edit-begin-input"
    /> bis
    <input
    type="text"
    value="${end}"
    class="edit-time-input js-edit-end-input"
    /> Uhr
  `;
}


function saveEntry(entry, editButton, dateInput, periodOfTimeInput) {
  const { date, begin, end } = updateEditStateAndStyle(editButton, entry);

  const newDateInput = document.querySelector('.js-edit-date-input');
  const newBeginInput = document.querySelector('.js-edit-begin-input');
  const newEndInput = document.querySelector('.js-edit-end-input');

  const newDate = newDateInput.value || date;
  const newBegin = newBeginInput.value || begin;
  const newEnd = newEndInput.value || end;

  dateInput.innerHTML = `${newDate}`;
  periodOfTimeInput.innerHTML = `Von ${newBegin} bis ${newEnd} Uhr`;

  const newDuration = calculateDuration(newBegin, newEnd);

  const index = timeList.findIndex(entry => entry.date === date && entry.begin === begin && entry.end === end);
  if (index !== -1) {
    // Update the entry with the new values
    timeList[index] = {
      date: newDate,
      begin: newBegin,
      end: newEnd,
      duration: newDuration
    };

    // Save the updated list to local storage
    addId();
    getWage(hourlyWage);
    renderTime();
    saveToStorage();
  }
}


function updateEditStateAndStyle(editButton, entry) {
  if (!edit) {
    editButton.innerText = "Speichern";
    editButton.style.backgroundColor = "red";
  } else {
    editButton.innerText = "Bearbeiten";
    editButton.style.backgroundColor = ""; 
  }

  edit = !edit;

  const {date, begin, end} = entry;
  return {date, begin, end};
}