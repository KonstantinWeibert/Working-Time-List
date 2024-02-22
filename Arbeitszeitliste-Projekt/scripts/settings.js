import { calculateAll } from "./infoGrid.js";
import { hourlyWage } from "./script.js";

let settingsVisible = false;

document.querySelector('.js-settings-button')
  .addEventListener('click', toggleSettings);

document.querySelector('.js-name-input-button')
  .addEventListener('click', getName);

document.querySelector('.js-wage-input-button')
  .addEventListener('click', () => getWage(hourlyWage));
 
export function getName() {
    const nameElement = document.querySelector('.js-name-input');
    const name = nameElement.value;
  
    localStorage.setItem('userName', name);
  
    document.querySelector('.js-title')
      .innerHTML = `Arbeitszeiten ${name}`;
  }
  
export function getWage(hourlyWage) {
    const wageElement = document.querySelector('.js-hourly-wage');
    const newHourlyWage = wageElement.value;
    localStorage.setItem('hourlyWage', newHourlyWage);

    hourlyWage = newHourlyWage;
  
    calculateAll(hourlyWage);
  }
  
function toggleSettings() {
  settingsVisible = !settingsVisible;
  const nameInputBox = document.querySelector('.js-name-input-box');
  const wageInputBox = document.querySelector('.js-wage-input-box');

  if (settingsVisible) {
    nameInputBox.style.display = 'flex';
    wageInputBox.style.display = 'flex';
  } else {
    nameInputBox.style.display = 'none';
    wageInputBox.style.display = 'none';
  }
}
