///////////////////////////////////////////////////////////////////////////////
// Global variables
///////////////////////////////////////////////////////////////////////////////
let addTaskBtn = document.getElementById('submitTask');

///////////////////////////////////////////////////////////////////////////////
// Gantt Object
///////////////////////////////////////////////////////////////////////////////
let gantt = {
  taskList: [],
  calendar: {
    numDisplayDays: 14,
    startDate: null,
    endDate: null
  },
  masterId: 0,
  selectedTask: null,

  setSerialNum: function (task) {
    task.id = this.masterId++;
    return task.id;
  },

  buildGantt: function () {
    console.log("buildGantt");
  },

  task: function (name, duration, startDate, parentTaskList, childTaskList, offset) {
    this.name = name;
    this.taskFamily = null;
    this.targetDuration = duration;
    this.trueDuration = duration;
    this.startDate = startDate;
    this.targetEndDate = new Date(startDate.getTime() + 86400000);
    this.trueEndDate = new Date(startDate.getTime() + 86400000);
    this.parentTaskList = [] || parentTaskList;
    this.childTaskList = [] || childTaskList;
    this.masterParent = null;
    this.offset = offset;
    this.element = null;
    this.delay = 0;
  },

  createDiv: function (id, className, style) {
    let parent = document.getElementById('gantt_Chart');
    let div = document.createElement('div');
    if (className === 'taskDiv') {
      //create two more divs, one for the target duration, and one for delay duration
      let targetDuration = document.createElement('div');
      let delayDuration = document.createElement('div');
      targetDuration.setAttribute('class', className + 'Child');
      targetDuration.setAttribute('id', id + 'Child');
      delayDuration.setAttribute('class', className + 'Child');
      delayDuration.setAttribute('id', id + 'Child');
      targetDuration.style.backgroundColor = style.color2;
      targetDuration.style.width = style.targetWidth;
      targetDuration.style.left = '0px';
      delayDuration.style.backgroundColor = style.color3;
      delayDuration.style.width = style.delayWidth;
      delayDuration.style.left = style.targetWidth;
      div.appendChild(targetDuration);
      div.appendChild(delayDuration);
    } else {
      div.style.backgroundColor = style.color;
    }
    div.setAttribute('class', className);
    div.setAttribute('id', id);
    div.style.width = style.width;
    if (style.top) {
      div.style.top = style.top;
    }
    if (style.left) {
      div.style.left = style.left;
    }
    parent.appendChild(div);
    this.createLabel(div, id, id + 'label', className + 'label');
    return div;
  },

  createLabel: function (parent, content, id, className) {
    let div = document.createElement('div');
    let label = document.createElement('label');
    let text = document.createTextNode(content);
    if (className === 'ganttDayDisplaylabel') {
      text = document.createTextNode(content.substring(0, content.indexOf('/', content.indexOf('/') + 1)));
    }
    div.setAttribute('class', className);
    label.setAttribute('id', id);
    label.appendChild(text);
    div.appendChild(label);
    parent.appendChild(div);
  },

  buildCalendar: function () {
    let startDate = new Date(2016, 6, 1);
    this.calendar.startDate = new Date(startDate);
    this.calendar.endDate = new Date(startDate.getTime() + this.calendar.numDisplayDays * 86400000);
    for (let i = 0; i < this.calendar.numDisplayDays; i++) {
      let displayDate = new Date(startDate.getTime() + i * 86400000);
      let id = displayDate.getUTCMonth() + " / " + displayDate.getUTCDate() + " / " + displayDate.getUTCFullYear();
      let className = 'ganttDayDisplay';
      let style = {
        width: 100 / gantt.calendar.numDisplayDays + '%',
        color: '#eee'
      };
      if (displayDate.getUTCDate() % 2 === 0) {
        style.color = '#999';
      }
      this.createDiv(id, className, style);
    }
  },

  graphTasks: function () {
    let vertOffSet = 2;
    for (let i = 0; i < this.taskList.length; i++) {
      //check to see if task is in range of calendar
      if (this.taskList[i].startDate >= this.calendar.startDate && this.taskList[i].startDate < this.calendar.endDate) {
        let left = (this.taskList[i].startDate.getTime() / 86400000 - this.calendar.startDate.getTime() / 86400000) / this.calendar.numDisplayDays * 100 + '%';
        let parentWidth = (this.taskList[i].targetDuration + this.taskList[i].delay) / this.calendar.numDisplayDays * 100 + '%';
        let targetNumDays = this.taskList[i].targetEndDate.getTime() / 86400000 - this.taskList[i].startDate.getTime() / 86400000;
        let trueNumDays = (this.taskList[i].trueEndDate.getTime() - this.taskList[i].startDate.getTime()) / 86400000;
        let targetWidth = targetNumDays / trueNumDays * 100 + '%';
        let delayWidth = 100 - targetNumDays / trueNumDays * 100 + '%';
        console.log(targetWidth + " " + delayWidth);
        let style = {
          width: parentWidth,
          targetWidth: targetWidth,
          delayWidth: delayWidth,
          color: 'white',
          color2: 'red',
          color3: 'blue',
          top: 60 * vertOffSet++ + 'px',
          left: left
        };
        let div = this.createDiv(this.taskList[i].name, 'taskDiv', style);
        this.dataBindTask(div, this.taskList[i]);
      }
    }
  },

  dataBindTask: function (element, task) {
    task.element = element;
    task.element.addEventListener('click', function () {
      gantt.clickTask(task);
    }, false);
  },

  clickTask: function (task) {
    //opens the popUP
    this.selectedTask = task;
    //get html elements
    let popUp = document.getElementById('taskEditPopUp');
    let name = document.getElementById('namePopUp');
    let targetDuration = document.getElementById('targetDurationPopUp');
    let trueDuration = document.getElementById('trueDurationPopUp');
    let startDate = document.getElementById('startDatePopUp');
    let targetEndDate = document.getElementById('targetEndDatePopUp');
    let trueEndDate = document.getElementById('trueEndDatePopUp');
    let delay = document.getElementById('delayPopUp');
    let submitBtn = document.getElementById('popUpSubmitBtn');
    //set default values from the object
    name.value = task.name;
    targetDuration.textContent = task.targetDuration;
    startDate.value = task.startDate.toISOString().substring(0, 10);
    targetEndDate.value = task.targetEndDate.toISOString().substring(0, 10);
    trueEndDate.textContent = task.trueEndDate.getMonth() + 1 + ' / ' + task.trueEndDate.getDate() + " / " + task.trueEndDate.getFullYear();
    delay.value = task.delay;
    trueDuration.textContent = task.trueDuration;
    //set up event listners
    submitBtn.addEventListener('click', gantt.editTask, false);
    popUp.setAttribute('class', 'popUp show');
  },

  setMasterParent: function (newTask) {
    let masterParent = this.findTask(newTask.parentTaskList[0]);
    let taskStartDate = masterParent.trueEndDate;
    for (let i = 0; i < newTask.parentTaskList.length; i++) {
      if (taskStartDate < this.findTask(newTask.parentTaskList[i]).trueEndDate) {
        masterParent = this.findTask(newTask.parentTaskList[i]);
        taskStartDate = masterParent.trueEndDate;
      }
    }
    newTask.masterParent = masterParent.id;
    newTask.startDate = taskStartDate;
    newTask.taskFamily = masterParent.taskFamily;
  },

  processNewTask: function (newTask) {
    if (newTask.startDate == 'Invalid Date') {
      //task is a child of another task, find start date based on parent with the latest end date.
      this.setMasterParent(newTask);
    } else {
      //task is a root level task.  set its task family to itself
      newTask.taskFamily = newTask.id;
    }
    newTask.targetEndDate = new Date(newTask.startDate.getTime() + newTask.targetDuration * 86400000);
    newTask.trueEndDate = new Date(newTask.startDate.getTime() + newTask.trueDuration * 86400000);
  },

  groupFamilies: function () {
    function recursiveAdd(task) {
      if (task.childTaskList) {
        for (let i = 0; i < task.childTaskList.length; i++) {
          let child = gantt.findTask(task.childTaskList[i]);
          if (child.masterParent === task.id) {
            groupedList.push(gantt.findTask(task.childTaskList[i]));
            recursiveAdd(gantt.findTask(task.childTaskList[i]));
          }
        }
      }
    }

    let groupedList = [];
    for (let i = 0; i < this.taskList.length; i++) {
      if (this.taskList[i].masterParent === null) {
        //found root task, add children Tasks
        groupedList.push(this.taskList[i]);
        recursiveAdd(this.taskList[i]);
      }
    }
    this.taskList = groupedList;
  },

  resetTaskGraph: function () {

    let taskDivList = document.querySelectorAll('.taskDiv');
    let parent = document.getElementById('gantt_Chart');
    for (let i = 0; i < taskDivList.length; i++) {
      parent.removeChild(taskDivList[i]);
    }
  },

  editTask: function (e) {
    e.preventDefault();
    let nameField = document.getElementById('namePopUp');
    let targetDurationField = document.getElementById('targetDurationPopUp');
    let trueDurationField = document.getElementById('trueDurationPopUp');
    let delayField = document.getElementById('delayPopUp');
    let startDateField = document.getElementById('startDatePopUp');
    let targetEndDateField = document.getElementById('targetEndDatePopUp');
    let trueEndDateField = document.getElementById('trueEndDatePopUp');
    let parentTaskListField = document.getElementById('parentTaskList');

    let name = nameField.value,
        targetDuration = Number(targetDurationField.value),
        delay = Number(delayField.value),
        startDate = startDateField.value.replace(/-/g, '/'),
        targetEndDate = targetEndDateField.value.replace(/-/g, '/');

    gantt.selectedTask.name = name;
    gantt.selectedTask.startDate = new Date(startDate);
    gantt.selectedTask.targetEndDate = new Date(targetEndDate);
    gantt.selectedTask.delay = delay;
    gantt.selectedTask.targetDuration = (gantt.selectedTask.targetEndDate.getTime() - gantt.selectedTask.startDate.getTime()) / 86400000;
    gantt.selectedTask.trueDuration = gantt.selectedTask.targetDuration + gantt.selectedTask.delay;
    gantt.selectedTask.trueEndDate = new Date(gantt.selectedTask.targetEndDate.getTime() + gantt.selectedTask.delay * 86400000);

    gantt.resetDependencies(gantt.selectedTask);
    gantt.groupFamilies();
    gantt.resetTaskGraph();
    gantt.graphTasks();
    closePopUp();
  },

  resetDependencies: function (task) {
    for (let i = 0; i < task.childTaskList.length; i++) {
      let child = gantt.findTask(task.childTaskList[i]);
      gantt.setMasterParent(child);
      child.targetEndDate = new Date(child.startDate.getTime() + child.targetDuration * 86400000);
      child.trueEndDate = new Date(child.startDate.getTime() + child.trueDuration * 86400000);
      if (child.childTaskList.length > 0) {
        gantt.resetDependencies(child);
      }
    }
  },

  findTask: function (id) {
    for (let i = 0; i < this.taskList.length; i++) {
      if (this.taskList[i].id === id) {
        return this.taskList[i];
      }
    }
    console.log('invalid id');
  }
};

///////////////////////////////////////////////////////////////////////////////
// Global functions
///////////////////////////////////////////////////////////////////////////////
function addTaskFromForm(e) {
  e.preventDefault();
  //define refrence to needed html fields
  let nameField = document.getElementById('taskName');
  let targetDurationField = document.getElementById('targetDuration');
  let startDateField = document.getElementById('startDate');
  let parentTaskListField = document.getElementById('parentTaskList');
  //parse needed values from html
  let name = nameField.value,
      targetDuration = Number(targetDurationField.value),
      startDate = startDateField.value;
  let parentTaskList = parentTaskListField.value.split(',');
  startDate = startDate.replace(/-/g, '/');
  //create the new task and store in the gantt task array
  gantt.taskList.push(new gantt.task(name, targetDuration, new Date(startDate), null, null, null, 'graph'));
  let newTask = gantt.taskList[gantt.taskList.length - 1];
  let id = gantt.setSerialNum(newTask);
  //update parent and child task lists
  for (let i = 0; i < parentTaskList.length; i++) {
    let match = parentTaskList[i];
    for (let j = 0; j < gantt.taskList.length; j++) {
      if (match === gantt.taskList[j].name) {
        gantt.taskList[j].childTaskList.push(id);
        newTask.parentTaskList.push(gantt.taskList[j].id);
      }
    }
  }
  //process and graph the task
  console.log(newTask);
  gantt.processNewTask(newTask);
  gantt.groupFamilies();
  gantt.resetTaskGraph();
  gantt.graphTasks();
  //clear html fields
  nameField.value = '', targetDurationField.value = '', startDateField.value = '', parentTaskListField.value = '';
}

function closePopUp() {
  let popUp = document.getElementById('taskEditPopUp');
  document.getElementById('popUpSubmitBtn').removeEventListener('click', gantt.editTask);
  gantt.selectedTask = null;
  popUp.setAttribute('class', 'popUp hide');
}

///////////////////////////////////////////////////////////////////////////////
// Main Code
///////////////////////////////////////////////////////////////////////////////

gantt.buildCalendar();
///////////////////////////////////////////////////////////////////////////////
// Event Listners
///////////////////////////////////////////////////////////////////////////////
addTaskBtn.addEventListener('click', addTaskFromForm, false);
document.getElementById('taskEditCloseBtn').addEventListener('click', closePopUp, false);