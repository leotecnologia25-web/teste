/* =========================================
AGENDA INTELIGENTE - LEOTECNOLOGIA
SCRIPT COMPLETO CORRIGIDO
========================================= */

let calendar;
let selectedEvent = null;

/* =========================================
SENHA ADMIN
========================================= */

const ownerPassword = "123456";

/* =========================================
PREÇOS
========================================= */

const servicePrices = {
"Suporte Técnico":80,
"Instalação":120,
"Manutenção":150,
"Designer":200
};

/* =========================================
HORÁRIOS DISPONÍVEIS
========================================= */

const totalSlots = [
"08:00",
"09:00",
"10:00",
"11:00",
"13:00",
"14:00",
"15:00",
"16:00",
"17:00"
];

/* =========================================
INICIALIZAÇÃO
========================================= */

document.addEventListener("DOMContentLoaded",()=>{

const calendarEl =
document.getElementById("calendar");

/* =========================================
CALENDÁRIO
========================================= */

calendar = new FullCalendar.Calendar(calendarEl,{

initialView:
window.innerWidth < 768
? "timeGridDay"
: "timeGridWeek",

locale:"pt-br",

editable:true,

selectable:true,

allDaySlot:false,

slotMinTime:"08:00:00",

slotMaxTime:"22:00:00",

height:350,

headerToolbar:{
left:"prev,next",
center:"title",
right:"today"
},

events:
JSON.parse(
localStorage.getItem("eventos")
) || [],

/* =========================================
SELEÇÃO
========================================= */

select:function(info){

document.getElementById("start").value =
formatDate(info.start);

},

/* =========================================
CLIQUE EVENTO
========================================= */

eventClick:function(info){

selectedEvent = info.event;

document.getElementById("modalTitle").innerHTML =
`<strong>Cliente:</strong><br>${info.event.title}`;

document.getElementById("modalDescription").innerHTML =
`<strong>Descrição:</strong><br>${info.event.extendedProps.description}`;

document.getElementById("modalDate").innerHTML =
`<strong>Data:</strong><br>${info.event.start.toLocaleString()}`;

document.getElementById("eventModal").style.display =
"flex";

},

/* =========================================
ARRASTAR EVENTO
========================================= */

eventDrop:function(){

saveEvents();

updateDashboard();

updateOccupiedTimes();

updateGarantias();

}

});

/* =========================================
RENDER
========================================= */

calendar.render();

updateDashboard();

updateOccupiedTimes();

updateGarantias();

blockPastTimes();

});

/* =========================================
FORMATAR DATA
========================================= */

function formatDate(date){

return date.toISOString().slice(0,16);

}

/* =========================================
SELECIONAR HORÁRIO
========================================= */

function selectTime(time){

const currentDate = new Date();

const year =
currentDate.getFullYear();

const month =
String(currentDate.getMonth()+1)
.padStart(2,"0");

const day =
String(currentDate.getDate())
.padStart(2,"0");

document.getElementById("start").value =
`${year}-${month}-${day}T${time}`;

}

/* =========================================
VERIFICAR HORÁRIO OCUPADO
========================================= */

function isTimeOccupied(start){

const selectedDate =
new Date(start);

const selectedDay =
selectedDate.toISOString().split("T")[0];

const selectedHour =
String(selectedDate.getHours())
.padStart(2,"0");

return calendar.getEvents().some(event=>{

const eventDate =
new Date(event.start);

const eventDay =
eventDate.toISOString().split("T")[0];

const eventHour =
String(eventDate.getHours())
.padStart(2,"0");

return (
selectedDay === eventDay &&
selectedHour === eventHour
);

});

}

/* =========================================
ATUALIZAR HORÁRIOS
========================================= */

function updateOccupiedTimes(){

const buttons =
document.querySelectorAll(".time-slot");

buttons.forEach(btn=>{

btn.classList.remove("occupied");

btn.disabled = false;

btn.innerHTML = btn.dataset.time;

});

const today = new Date();

calendar.getEvents().forEach(event=>{

const eventDate =
new Date(event.start);

const sameDay =
eventDate.toDateString()
=== today.toDateString();

if(sameDay){

const hour =
String(eventDate.getHours())
.padStart(2,"0") + ":00";

buttons.forEach(btn=>{

if(btn.dataset.time === hour){

btn.classList.add("occupied");

btn.disabled = true;

btn.innerHTML =
"🔴 Ocupado";

}

});

}

});

}

/* =========================================
ADICIONAR EVENTO
========================================= */

function addEvent(){

const saveBtn =
document.getElementById("saveBtn");

saveBtn.disabled = true;

saveBtn.innerText =
"Salvando...";

/* =========================================
CAPTURA
========================================= */

const clientName =
document.getElementById("clientName")
.value
.trim();

const clientPhone =
document.getElementById("clientPhone")
.value
.trim();

const serviceType =
document.getElementById("serviceType")
.value;

const status =
document.getElementById("statusService")
.value;

const description =
document.getElementById("description")
.value
.trim();

const start =
document.getElementById("start")
.value;

/* =========================================
VALIDAÇÃO
========================================= */

if(
!clientName ||
!clientPhone ||
!serviceType ||
!description ||
!start
){

alert("⚠️ Preencha todos os campos!");

resetSaveButton();

return;

}

/* =========================================
HORÁRIO OCUPADO
========================================= */

if(isTimeOccupied(start)){

alert("❌ Este horário já está ocupado!");

resetSaveButton();

return;

}

/* =========================================
CRIAR EVENTO
========================================= */

calendar.addEvent({

title:
`${serviceType} - ${clientName}`,

start:start,

description:description,

status:status,

phone:clientPhone,

color:"#ef4444"

});

/* =========================================
SALVAR
========================================= */

saveEvents();

updateDashboard();

updateOccupiedTimes();

updateGarantias();

playNotification();

/* =========================================
WHATSAPP
========================================= */

const servicePrice =
servicePrices[serviceType] || 0;

sendWhatsAppToOwner(
clientName,
clientPhone,
serviceType,
description,
start,
status,
servicePrice
);

/* =========================================
FINALIZAÇÃO
========================================= */

alert("✅ Agendamento salvo!");

clearForm();

resetSaveButton();

}

/* =========================================
RESET BOTÃO
========================================= */

function resetSaveButton(){

const saveBtn =
document.getElementById("saveBtn");

saveBtn.disabled = false;

saveBtn.innerText =
"💾 Salvar Agendamento";

}

/* =========================================
LIMPAR FORMULÁRIO
========================================= */

function clearForm(){

document.getElementById("clientName").value = "";

document.getElementById("clientPhone").value = "";

document.getElementById("serviceType").value = "";

document.getElementById("statusService").value =
"Agendado";

document.getElementById("description").value = "";

document.getElementById("start").value = "";

}

/* =========================================
SALVAR LOCALSTORAGE
========================================= */

function saveEvents(){

const events = [];

calendar.getEvents().forEach(event=>{

events.push({

title:event.title,

start:event.start,

description:
event.extendedProps.description,

status:
event.extendedProps.status,

phone:
event.extendedProps.phone,

color:"#ef4444"

});

});

localStorage.setItem(
"eventos",
JSON.stringify(events)
);

}

/* =========================================
WHATSAPP
========================================= */

function sendWhatsAppToOwner(
clientName,
clientPhone,
serviceType,
description,
date,
status,
servicePrice
){

const ownerPhone =
"5598999942905";

const message = `
📅 *NOVO AGENDAMENTO*

👤 Cliente:
${clientName}

📞 Telefone:
${clientPhone}

🛠️ Serviço:
${serviceType}

💰 Valor:
R$ ${servicePrice}

📌 Status:
${status}

📝 Descrição:
${description}

⏰ Data:
${new Date(date).toLocaleString()}
`;

const url =
`https://wa.me/${ownerPhone}?text=${encodeURIComponent(message)}`;

window.open(url,"_blank");

}

/* =========================================
MODAL
========================================= */

function closeModal(){

document.getElementById("eventModal").style.display =
"none";

}

/* =========================================
DELETAR EVENTO
========================================= */

function deleteSelectedEvent(){

if(selectedEvent){

const password =
prompt("🔒 Digite a senha:");

if(password !== ownerPassword){

alert("❌ Senha incorreta!");

return;

}

selectedEvent.remove();

saveEvents();

updateDashboard();

updateOccupiedTimes();

updateGarantias();

closeModal();

alert("🗑️ Agendamento deletado!");

}

}

/* =========================================
DASHBOARD
========================================= */

function updateDashboard(){

const today = new Date();

const todayEvents =
calendar.getEvents().filter(event=>{

const eventDate =
new Date(event.start);

return (
eventDate.toDateString()
=== today.toDateString()
);

});

const totalToday =
todayEvents.length;

const occupiedSlots =
todayEvents.map(event=>{

return String(
new Date(event.start)
.getHours()
).padStart(2,"0") + ":00";

});

const freeTimes =
totalSlots.filter(
slot=>!occupiedSlots.includes(slot)
).length;

const uniqueClients =
new Set(

calendar.getEvents().map(event=>{

const parts =
event.title.split(" - ");

return parts[1] || event.title;

})

);

document.getElementById("todayCount").innerText =
totalToday;

document.getElementById("freeCount").innerText =
freeTimes;

document.getElementById("clientCount").innerText =
uniqueClients.size;

}

/* =========================================
GARANTIAS
========================================= */

function updateGarantias(){

const garantiaList =
document.getElementById("garantiaList");

const events =
calendar.getEvents();

if(events.length === 0){

garantiaList.innerHTML = `
<div class="garantia-item">

<div>

<strong>
Nenhuma garantia próxima
</strong>

<br>

Os serviços aparecerão aqui.

</div>

<div class="garantia-badge green">
OK
</div>

</div>
`;

return;

}

const today = new Date();

const futureEvents = [];

events.forEach(event=>{

const serviceDate =
new Date(event.start);

const garantiaDate =
new Date(serviceDate);

garantiaDate.setDate(
garantiaDate.getDate() + 90
);

const diffDays =
Math.ceil(
(garantiaDate - today)
/
(1000 * 60 * 60 * 24)
);

futureEvents.push({

title:event.title,

days:diffDays,

date:garantiaDate

});

});

futureEvents.sort((a,b)=>a.days - b.days);

garantiaList.innerHTML = "";

futureEvents.slice(0,5).forEach(item=>{

let badgeClass = "green";
let badgeText = "OK";

if(item.days <= 30){

badgeClass = "yellow";
badgeText = "Próxima";

}

if(item.days <= 7){

badgeClass = "red";
badgeText = "Urgente";

}

garantiaList.innerHTML += `

<div class="garantia-item">

<div>

<strong>
${item.title}
</strong>

<br>

Garantia até:
${item.date.toLocaleDateString()}

</div>

<div class="garantia-badge ${badgeClass}">

${badgeText}

</div>

</div>

`;

});

}

/* =========================================
BUSCA
========================================= */

function searchEvents(){

const search =
document.getElementById("searchClient")
.value
.toLowerCase();

calendar.getEvents().forEach(event=>{

const title =
event.title.toLowerCase();

if(title.includes(search)){

event.setProp("display","auto");

}else{

event.setProp("display","none");

}

});

}

/* =========================================
TEMA
========================================= */

function toggleTheme(){

document.body.classList.toggle(
"light-theme"
);

}

/* =========================================
EXPORTAR BACKUP
========================================= */

function exportBackup(){

const data =
localStorage.getItem("eventos");

const blob =
new Blob(
[data],
{type:"application/json"}
);

const url =
URL.createObjectURL(blob);

const a =
document.createElement("a");

a.href = url;

a.download =
"backup_agenda.json";

a.click();

}

/* =========================================
NOTIFICAÇÃO
========================================= */

function playNotification(){

const audio = new Audio(
"https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
);

audio.play();

}

/* =========================================
BLOQUEAR PASSADOS
========================================= */

function blockPastTimes(){

const now = new Date();

const buttons =
document.querySelectorAll(".time-slot");

buttons.forEach(btn=>{

const hour =
parseInt(
btn.dataset.time.split(":")[0]
);

if(hour <= now.getHours()){

btn.disabled = true;

btn.style.opacity = "0.5";

}

});

}

/* =========================================
FECHAR MODAL
========================================= */

window.onclick = function(event){

const modal =
document.getElementById("eventModal");

if(event.target === modal){

closeModal();

}

};
