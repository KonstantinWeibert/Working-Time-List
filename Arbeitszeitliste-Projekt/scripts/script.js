import { getName, getWage } from "./settings.js";
import { editButton } from "./edit.js";
import { calculateAll } from "./infoGrid.js";

export let timeList = JSON.parse(localStorage.getItem('timeList')) || [];

export let hourlyWage;
export let monthValue;
let convertedDateArray;
let monthOption;
let holidays;


document.addEventListener("DOMContentLoaded", () => {
  fetchHolidays();
  // get current, realtime month
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  
  // set the default option value the same as current month
  const monthSelect = document.getElementById("monthSelect");
  monthSelect.value = currentMonth < 10 ? "0" + currentMonth : currentMonth;
  
  // get hourlyWage from storage
  hourlyWage = localStorage.getItem('hourlyWage');
  if (hourlyWage) {
    document.querySelector('.js-hourly-wage').value = hourlyWage;
  }
  
  // get userName from storage
  let userName = localStorage.getItem('userName');
  if (userName) {
    document.querySelector('.js-name-input').value = userName;
    getName();
  }
  
  getWage();
});

function fetchHolidays() {
  fetch('https://get.api-feiertage.de/?states=nw')
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    holidays = data.feiertage;
    
    convertedDateArray = holidays.map((holiday) => {
      const dateOrder = holiday.date.split('-');
      return dateOrder[2] + "." + dateOrder[1] + "." + dateOrder[0];
    });
    renderTime();
  })
  .catch(error => {
    console.error('Fehler beim Laden der Feiertagsdaten:', error);
  });
}

document.querySelector('.js-add-button')
  .addEventListener('click', addTime);

document.querySelector('.js-confirm-button')
  .addEventListener('click', () => {
    document.querySelector('.pop-up').classList.remove('show');
    document.querySelector('.js-overlay').classList.remove('show');
  });

export function renderTime() {
  setMonth();
  let gridHTML = '';
  
  timeList.forEach((time) => {
    const { date, begin, end, duration } = time;
    const month = getMonth(date);
    
    if (month === monthValue) {
      gridHTML += `
      <div class="time-grid">
        <div class="js-date-${time.id}">${date}</div>
        <div class="period-of-time js-period-of-time-${time.id}">Von ${begin} bis ${end} Uhr</div>
        <div class="js-duration-${time.id}">${duration} Stunden</div>
        <button class="edit-button js-edit-button" data-edit-id="${time.id}">Bearbeiten</button>
        <button class="remove-button js-remove-button" data-delete-id="${time.id}">Entfernen</button>
      </div>
      `;
      
    }
  });
  
  document.querySelector('.js-times')
  .innerHTML = gridHTML;
  
  timeList.forEach((time) => {
    const timeElement = document.querySelector(`.js-period-of-time-${time.id}`);
    if (timeElement) {
      holidayHTML(time);
    }
  });

  deleteButton();
  editButton();
}

function holidayHTML(time) {
  const { id, date } = time;
  const timeElement = document.querySelector(`.js-period-of-time-${id}`);
  const month = getMonth(date);

  if (timeElement && month === monthValue) {
    if (convertedDateArray.includes(date)) {
      timeElement.innerText = "Feiertag";
      document.querySelector(`.js-duration-${id}`).innerText = "5.00 Stunden";
    } else {
      const { begin, end} = time;
      timeElement.innerText = `Von ${begin} bis ${end} Uhr`;
    }
  } else {
    console.error(`Element '.js-period-of-time-${id}' wurde nicht gefunden.`);
  }
}

function addTime() {
  document.querySelector('.js-error-text').innerHTML = ''; 

  const dateElement = document.querySelector('.js-date-input');
  const beginElement = document.querySelector('.js-time-interval1');
  const endElement = document.querySelector('.js-time-interval2');

  //check if all required fields are filled
  if (!dateElement.value) {
    return showPopupAndOverlay('Bitte ein Datum auswählen!');
  }
  
  if (!beginElement.value || !endElement.value) {
    return showPopupAndOverlay('Bitte Uhrzeiten überprüfen!');
  }

  // convert from YYYY-MM-DD to DD.MM.YYYY
  const dateOrderElement = dateElement.value;
  const dateOrder = dateOrderElement.split('-');
  const date = dateOrder[2] + "." + dateOrder[1] + "." + dateOrder[0];
  
  const begin = beginElement.value;
  const end = endElement.value;

  // calculate initial duration
  let duration = calculateDuration(begin, end);

  // make sure end time is greater than start time
  if (duration <= 0) {
    return showPopupAndOverlay('Bitte Uhrzeiten überprüfen!');
  }

  timeList.push({
    date,
    begin,
    end,
    duration
  });
  
  beginElement.value = '';
  endElement.value = '';
  
  addId(); // give new object an ID
  calculateAll(hourlyWage);
  renderTime();
  saveToStorage();
}

function deleteButton() {
  document.querySelectorAll('.js-remove-button')
    .forEach((deleteButton) => {
      deleteButton.addEventListener('click', () => {
        const id = parseInt(deleteButton.dataset.deleteId); // get the ID
        timeList.splice(id, 1); // remove the time with the assigned id

        addId(); // reassign id's
        renderTime();
        calculateAll(hourlyWage);
        saveToStorage();
      });
    }); 
}

export function calculateDuration (startTimes, endTimes) {
  const startTimeArray = startTimes.split(':');
  const endTimeArray = endTimes.split(':');

  const startTime = parseInt(startTimeArray[0]) + parseInt(startTimeArray[1]) / 60;
  const endTime = parseInt(endTimeArray[0]) + parseInt(endTimeArray[1]) / 60;

  let duration = (endTime - startTime).toFixed(2);

  // calculate break time
  if (duration >= 9) {
    duration -= 1;
    duration = Number(duration).toFixed(2);
  } else if (duration >= 5) {
    duration -= 0.50;
    duration = Number(duration).toFixed(2);
  } else if (duration >= 4.5) {
    duration -= 0.25;
  }

  return duration;
}

function showPopupAndOverlay(message) {
  document.querySelector('.js-error-text').innerHTML = message;
  document.querySelector('.pop-up').classList.add('show');
  document.querySelector('.js-overlay').classList.add('show');
}

export function addId() {
  // assign an ID to each object
  timeList.forEach((time, i) => {
    time.id = i;
  })
}

export function getMonth(date) {
  const monthArray = date.split('.');
  const month = monthArray[1];

  return month;
}


export function setMonth() {
  let monthChangeListenerAdded = false;
  
  monthOption = document.querySelector('.js-month-input');
  monthValue = monthOption.value;

  // Füge den Event-Listener für den Monatswechsel hinzu, wenn er noch nicht vorhanden ist
  if (!monthChangeListenerAdded) {
    monthOption.addEventListener('change', handleMonthChange);
    monthChangeListenerAdded = true;
  }
}

function handleMonthChange() {
  calculateAll(hourlyWage);
  renderTime();
}

export function saveToStorage() {
  localStorage.setItem('timeList', JSON.stringify(timeList));
}