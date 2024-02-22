import { timeList, setMonth, getMonth, monthValue } from "./script.js";

export function calculateAll(hourlyWage) {
  setMonth();
  let workingTime = 0;
  
  timeList.forEach((workingDay) => {
    const { date } = workingDay;
    const month = getMonth(date);

    if (month === monthValue) {
      const duration = workingDay.duration;
      workingTime += Number(duration);
    }
  });
  
  const wage = workingTime * hourlyWage;
  
  document.querySelector('.working-time')
  .innerHTML = `Ingesamt: ${workingTime.toFixed(2)} Stunden`;
  document.querySelector('.wage')
  .innerHTML = `Insgesamt: ${wage.toFixed(2)} €`;
}