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
    this.duration = duration;
    this.startDate = startDate;
    this.endDate = new Date(startDate.getTime() + 86400000);
    this.parentTaskList = [] || parentTaskList;
    this.childTaskList = [] || childTaskList;
    this.masterParent = null;
    this.offset = offset;
    this.element = null;
  },

  createDiv: function (id, className, style) {
    let parent = document.getElementById('gantt_Chart');
    let div = document.createElement('div');
    div.setAttribute('class', className);
    div.setAttribute('id', id);
    div.style.width = style.width;
    div.style.backgroundColor = style.color;
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
    let startDate = new Date(2016, 5, 1);
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
        let style = {
          width: this.taskList[i].duration / this.calendar.numDisplayDays * 100 + '%',
          color: 'red',
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
    task.element.addEventListener('click', function () {}, false);
  },

  setMasterParent: function (newTask) {
    let masterParent = this.findTask(newTask.parentTaskList[0]);
    let taskStartDate = masterParent.endDate;
    for (let i = 0; i < newTask.parentTaskList.length; i++) {
      if (taskStartDate < this.findTask(newTask.parentTaskList[i]).endDate) {
        masterParent = this.findTask(newTask.parentTaskList[i]);
        taskStartDate = masterParent.endDate;
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
    newTask.endDate = new Date(newTask.startDate.getTime() + newTask.duration * 86400000);
  },

  groupFamilies: function () {
    function recursiveAdd(task) {
      if (task.childTaskList) {
        for (let i = 0; i < task.childTaskList.length; i++) {
          groupedList.push(gantt.findTask(task.childTaskList[i]));
          recursiveAdd(gantt.findTask(task.childTaskList[i]));
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
  let durationField = document.getElementById('duration');
  let startDateField = document.getElementById('startDate');
  let parentTaskListField = document.getElementById('parentTaskList');
  //parse needed values from html
  let name = nameField.value,
      duration = durationField.value,
      startDate = startDateField.value;
  let parentTaskList = parentTaskListField.value.split(',');
  startDate = startDate.replace(/-/g, '/');
  //create the new task and store in the gantt task array
  gantt.taskList.push(new gantt.task(name, duration, new Date(startDate), null, null));
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
  gantt.processNewTask(newTask);
  gantt.groupFamilies();
  gantt.resetTaskGraph();
  gantt.graphTasks();
  //clear html fields
  nameField.value = '', durationField.value = '', startDateField.value = '', parentTaskListField.value = '';
}

///////////////////////////////////////////////////////////////////////////////
// Main Code
///////////////////////////////////////////////////////////////////////////////

gantt.buildCalendar();
///////////////////////////////////////////////////////////////////////////////
// Event Listners
///////////////////////////////////////////////////////////////////////////////
addTaskBtn.addEventListener('click', addTaskFromForm, false);