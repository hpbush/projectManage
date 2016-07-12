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
  state: {
    selectedTask: null,
    selectDependencyMode: {
      active: false,
      clickedObj: null,
      tempDependencyList: []
    },
    masterId: 0
  },

  //////////////////////////////////////////////////////////////////////////////
  //graphing / DOM manipulation
  //////////////////////////////////////////////////////////////////////////////
  buildCalendar: function(){
    let startDate = new Date(2016, 6, 1);
    this.calendar.startDate = new Date(startDate);
    this.calendar.endDate = new Date(startDate.getTime() + (this.calendar.numDisplayDays * 86400000));
    for(let i = 0; i < this.calendar.numDisplayDays; i++){
      let displayDate = new Date(startDate.getTime() + (i * 86400000));
      let id = displayDate.getUTCMonth() + " / " + displayDate.getUTCDate() + " / " +  displayDate.getUTCFullYear();
      let className = 'ganttDayDisplay';
      let style = {
        width: 100 / gantt.calendar.numDisplayDays + '%',
        color: '#eee'
      }
      if(displayDate.getUTCDate() % 2 === 0){
        style.color = '#999';
      }
      this.createDiv(id, className, style);
    }
  },

  graphTasks: function(){
    let vertOffSet = 2;
    for(let i = 0; i < this.taskList.length; i++){
      //check to see if task is in range of calendar
      if(this.taskList[i].startDate >= this.calendar.startDate && this.taskList[i].startDate < this.calendar.endDate){
        let left = (((this.taskList[i].startDate.getTime() / 86400000) - (this.calendar.startDate.getTime() / 86400000)) / this.calendar.numDisplayDays) * 100 + '%';
        let parentWidth = ((this.taskList[i].targetDuration + this.taskList[i].delay) / this.calendar.numDisplayDays) * 100 + '%';
        let targetNumDays = ((this.taskList[i].targetEndDate.getTime() / 86400000) - (this.taskList[i].startDate.getTime() / 86400000));
        let trueNumDays = (this.taskList[i].trueEndDate.getTime() - this.taskList[i].startDate.getTime()) / 86400000;
        let targetWidth = (targetNumDays / trueNumDays) * 100 + '%';
        let delayWidth = 100 - ((targetNumDays / trueNumDays) * 100) + '%';
        let style = {
          width: parentWidth,
          targetWidth: targetWidth,
          delayWidth: delayWidth,
          color: 'white',
          color2: 'red',
          color3: 'blue',
          top: (60 * vertOffSet++) + 'px',
          left: left
        };
        let div = this.createDiv(this.taskList[i].name, 'taskDiv', style);
        this.dataBindTask(div, this.taskList[i]);
      }
    }
  },

  resetTaskGraph: function(){
    let taskDivList = document.querySelectorAll('.taskDiv');
    let parent = document.getElementById('gantt_Chart');
    for(let i = 0; i < taskDivList.length; i++){
      parent.removeChild(taskDivList[i]);
    }
  },

  createDiv: function(id, className, style){
    let parent = document.getElementById('gantt_Chart');
    let div = document.createElement('div');
    if(className === 'taskDiv'){
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
    }else{
      div.style.backgroundColor = style.color;
    }
    div.setAttribute('class', className);
    div.setAttribute('id', id);
    div.style.width = style.width;
    if(style.top){div.style.top = style.top;}
    if(style.left){div.style.left = style.left;}
    parent.appendChild(div);
    this.createLabel(div, id,id + 'label', className + 'label');
    return div;
  },

  createLabel: function(parent, content, id, className){
    let div = document.createElement('div');
    let label = document.createElement('label');
    let text = document.createTextNode(content);
    if(className === 'ganttDayDisplaylabel'){
      text = document.createTextNode(content.substring(0, content.indexOf('/', content.indexOf('/')+1)  ))
    }
    div.setAttribute('class', className);
    label.setAttribute('id',id);
    label.appendChild(text);
    div.appendChild(label);
    parent.appendChild(div);
  },

  //////////////////////////////////////////////////////////////////////////////
  //task creation / manipulation
  //////////////////////////////////////////////////////////////////////////////
  task: function(name, duration, startDate, parentTaskList, childTaskList, offset){
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

  addTaskFromForm: function(e){
    e.preventDefault();
    if(gantt.state.selectDependencyMode.active){
      return;
      //will need to alert an error to user at some point!
    }
    //define refrence to needed html fields
    let nameField = document.getElementById('taskName');
    let targetDurationField = document.getElementById('targetDuration');
    let startDateField = document.getElementById('startDate');
    let parentTaskListField = document.getElementById('parentTaskList');
    //parse needed values from html
    let name = nameField.value, targetDuration = Number(targetDurationField.value), startDate = startDateField.value;
    let parentTaskList = parentTaskListField.value.split(',');
    startDate = startDate.replace(/-/g, '/');
    //create the new task and store in the gantt task array
    gantt.taskList.push(new gantt.task(name, targetDuration, new Date(startDate), null, null, null));
    let newTask = gantt.taskList[gantt.taskList.length - 1];
    let id = gantt.setSerialNum(newTask);
    //update parent and child task lists
    for(let i = 0; i < parentTaskList.length; i++){
      let match = parentTaskList[i];
      for(let j = 0; j < gantt.taskList.length; j++){
        if(match === gantt.taskList[j].name){
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
  },

  editTask: function(e){
    e.preventDefault();
    let nameField = document.getElementById('namePopUp');
    let targetDurationField = document.getElementById('targetDurationPopUp');
    let trueDurationField = document.getElementById('trueDurationPopUp');
    let delayField = document.getElementById('delayPopUp');
    let startDateField = document.getElementById('startDatePopUp');
    let targetEndDateField = document.getElementById('targetEndDatePopUp');
    let trueEndDateField = document.getElementById('trueEndDatePopUp');
    let parentTaskListField = document.getElementById('parentTaskList');

    let name = nameField.value, targetDuration = Number(targetDurationField.value), delay = Number(delayField.value), startDate = startDateField.value.replace(/-/g, '/'), targetEndDate = targetEndDateField.value.replace(/-/g, '/');

    gantt.state.selectedTask.name = name;
    gantt.state.selectedTask.startDate = new Date(startDate);
    gantt.state.selectedTask.targetEndDate = new Date(targetEndDate);
    gantt.state.selectedTask.delay = delay;
    gantt.state.selectedTask.targetDuration = (gantt.state.selectedTask.targetEndDate.getTime() - gantt.state.selectedTask.startDate.getTime()) / 86400000;
    gantt.state.selectedTask.trueDuration = gantt.state.selectedTask.targetDuration + gantt.state.selectedTask.delay;
    gantt.state.selectedTask.trueEndDate = new Date(gantt.state.selectedTask.targetEndDate.getTime() + gantt.state.selectedTask.delay * 86400000);

    gantt.resetDependencies(gantt.state.selectedTask);
    gantt.groupFamilies();
    gantt.resetTaskGraph();
    gantt.graphTasks();

    gantt.closePopUp(null);
  },

  dataBindTask: function(element, task){
    task.element = element;
    task.element.addEventListener('click', function(e){
      if(gantt.state.selectDependencyMode.active === false){
        gantt.clickTask(task);
      }else{
        gantt.state.selectDependencyMode.clickedObj = task;
        gantt.selectTaskForDependency(e);
      }
    }, false);
  },

  setMasterParent: function(newTask){
    let masterParent = this.findTask(newTask.parentTaskList[0]);
    let taskStartDate = masterParent.trueEndDate;
    for(let i = 0; i < newTask.parentTaskList.length; i++){
      if(taskStartDate < this.findTask(newTask.parentTaskList[i]).trueEndDate){
        masterParent = this.findTask(newTask.parentTaskList[i]);
        taskStartDate = masterParent.trueEndDate;
      }
    }
    newTask.masterParent = masterParent.id;
    newTask.startDate = taskStartDate;
    newTask.taskFamily = masterParent.taskFamily;
  },

  processNewTask: function(newTask){
    if(newTask.parentTaskList.length > 0){
      this.setMasterParent(newTask);
    }else{
      //task is a root level task.  set its task family to itself
      newTask.taskFamily = newTask.id;
    }
    newTask.targetEndDate = new Date(newTask.startDate.getTime() + (newTask.targetDuration * 86400000));
    newTask.trueEndDate = new Date(newTask.startDate.getTime() + (newTask.trueDuration * 86400000));
  },

  groupFamilies: function(){
    function recursiveAdd(task){
      if(task.childTaskList){
        for(let i = 0; i < task.childTaskList.length; i++){
          let child = gantt.findTask(task.childTaskList[i]);
          if(child.masterParent === task.id){
            groupedList.push(gantt.findTask(task.childTaskList[i]));
            recursiveAdd(gantt.findTask(task.childTaskList[i]));
          }
        }
      }
    }
    let groupedList = [];
    for(let i = 0; i < this.taskList.length; i++){
      if(this.taskList[i].masterParent === null){
        //found root task, add children Tasks
        groupedList.push(this.taskList[i]);
        recursiveAdd(this.taskList[i]);
      }
    }
    this.taskList = groupedList;
  },

  resetDependencies: function(task){
    for(let i = 0; i < task.childTaskList.length; i++){
      let child = gantt.findTask(task.childTaskList[i]);
      gantt.setMasterParent(child);
      child.targetEndDate = new Date(child.startDate.getTime() + child.targetDuration * 86400000);
      child.trueEndDate = new Date(child.startDate.getTime() + child.trueDuration * 86400000);
      if(child.childTaskList.length > 0){
        gantt.resetDependencies(child);
      }
    }
  },

  //////////////////////////////////////////////////////////////////////////////
  //tools / initialization / buttons
  //////////////////////////////////////////////////////////////////////////////
  setSerialNum: function(task){
    task.id = this.state.masterId++;
    return task.id;
  },

  buildGantt: function() {
    console.log("buildGantt");
  },

  clickTask: function(task){ //opens the popUP
    if(this.state.selectedTask){
      this.state.selectedTask.element.setAttribute('class', 'taskDiv');
    }
    this.state.selectedTask = task;
    task.element.setAttribute('class', 'taskDiv active');
    //get html elements
    let popUp = document.getElementById('taskEditPopUp');
    let name = document.getElementById('namePopUp');
    let targetDuration = document.getElementById('targetDurationPopUp');
    let trueDuration = document.getElementById('trueDurationPopUp');
    let startDate = document.getElementById('startDatePopUp');
    let targetEndDate = document.getElementById('targetEndDatePopUp');
    let trueEndDate = document.getElementById('trueEndDatePopUp');
    let delay = document.getElementById('delayPopUp');
    let depList = document.getElementById('dependencyUL');
    //clear html inside the depList
    depList.innerHTML = '';
    //set default values from the object
    name.value = task.name;
    targetDuration.textContent = task.targetDuration;
    startDate.value = task.startDate.toISOString().substring(0,10);
    targetEndDate.value = task.targetEndDate.toISOString().substring(0,10);
    trueEndDate.textContent = task.trueEndDate.getMonth() + 1 + ' / ' + task.trueEndDate.getDate() + " / " + task.trueEndDate.getFullYear();
    delay.value = task.delay;
    trueDuration.textContent = task.trueDuration;
    popUp.setAttribute('class','popUp show');
    //build parent Dependency List
    for(let i = 0; i < task.parentTaskList.length; i++){
      let parent = gantt.findTask(task.parentTaskList[i]);
      let li = document.createElement('li');
      let text = document.createTextNode(parent.name);
      li.appendChild(text);
      depList.appendChild(li);
      li.addEventListener('click', function(){
        console.log(parent);
      },false);
    }
  },

  closePopUp: function(selectedTask){
    document.getElementById('taskEditPopUp').setAttribute('class', 'popUp hide');
    gantt.state.selectedTask = selectedTask;
  },

  addDependencyBtn: function(e){
    e.preventDefault();
    gantt.state.selectDependencyMode.active = true;
    let currentTask = gantt.state.selectedTask;
    gantt.closePopUp(currentTask);
    let addDependencyPopUp = document.getElementById('addDependencyPopUp');
    addDependencyPopUp.setAttribute('class','addDependencyPopUp');
  },

  selectTaskForDependency: function(e){
    let active = gantt.state.selectedTask;
    let clicked = gantt.state.selectDependencyMode.clickedObj;

    if(clicked.element.getAttribute('class') === 'taskDiv' || clicked.element.getAttribute('class') === 'taskDiv active'){
      //user has selected the task to become a dependency
      if(active !== clicked){ // prevent user from setting active task as dependency of its self
        let foundChild = false;
        let foundParent = false;

        function checkChildren(task){ // prevents user from setting one of the children of the active tasks as a dependency of the active task.
          for(let i = 0; i < task.childTaskList.length; i++){
            let child = gantt.findTask(task.childTaskList[i]);
            if(child === clicked){
              foundChild = true;
              return;
            }
            if(child.childTaskList.length > 0){
              checkChildren(child);
            }
          }
          if(foundChild === true) return false;
          else return true;
        }

        function checkParents(task){ // prevents user from setting one of the parents of the active task as a dependency of the active task.
          for(let i = 0; i < task.parentTaskList.length; i++){
            let parent = gantt.findTask(task.parentTaskList[i]);
            if(parent === clicked || foundParent){
              foundParent = true;
              return;
            }
            if(parent.parentTaskList.length > 0){
              checkParents(parent);
            }
          }
          if(foundParent === true) return false;
          else return true;
        }

        if(checkChildren(active)){
          if(checkParents(active)){
            // here is where the clicked element will be confirmed as a candidate for being a dependency, Check other members of the tempDependencyList to see if the clicked
            //obj already shares a dependency with another candidate.
            let list = gantt.state.selectDependencyMode.tempDependencyList;
            for(let i = 0; i < list.length; i++){
              foundChild = false;
              foundParent = false;
              foundChild = !checkChildren(list[i]);
              foundParent = !checkParents(list[i]);
              if(foundChild || foundParent){
                list[i].element.setAttribute('class', 'taskDiv');
                list.splice(i, 1);
              }
            }
            clicked.element.setAttribute('class','taskDiv Select');
            gantt.state.selectDependencyMode.tempDependencyList.push(clicked);
          }else{
            window.alert(active.name + " is already dependent on " + clicked.name);
          }
        }else{
          window.alert("you cannot make a task dependent on one of its current dependencies!");
        }

      }else{
        window.alert("You can not make a task dependent on its self!");
      }
    }else if(clicked.element.getAttribute('class') === 'taskDiv Select'){
      //user has unselected the task as a dependency
      clicked.element.setAttribute('class','taskDiv');
      let index = gantt.state.selectDependencyMode.tempDependencyList.indexOf(clicked);
      gantt.state.selectDependencyMode.tempDependencyList.splice(index, 1);
    }
  },

  dependencyDecide: function(e, bool){
    e.preventDefault();
    let active = gantt.state.selectedTask;
    let list = gantt.state.selectDependencyMode.tempDependencyList;
    if(bool){
      if(list.length > 0){
        for(let i = 0; i < list.length; i++){
          list[i].childTaskList.push(active.id);
          active.parentTaskList.push(list[i].id);
          list[i].element.setAttribute('class','taskDiv');
        }
      }

      gantt.processNewTask(active);
      gantt.resetDependencies(active);
      gantt.groupFamilies();
      gantt.resetTaskGraph();
      gantt.graphTasks();
    }else{
      for(let i = 0; i < list.length; i++){
        list[i].element.setAttribute('class','taskDiv');
      }
    }

    gantt.state.selectDependencyMode.active = false;
    gantt.state.selectDependencyMode.clickedObj = null;
    gantt.state.selectDependencyMode.tempDependencyList = [];
    let addDependencyPopUp = document.getElementById('addDependencyPopUp');
    addDependencyPopUp.setAttribute('class','addDependencyPopUp hide');
    gantt.clickTask(gantt.state.selectedTask);
  },

  findTask: function(id){
    for(let i = 0; i < this.taskList.length; i++){
      if(this.taskList[i].id === id){
        return this.taskList[i];
      }
    }
    console.log('invalid id');
  }
}

///////////////////////////////////////////////////////////////////////////////
// Global functions
///////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////
// Main Code
///////////////////////////////////////////////////////////////////////////////

gantt.buildCalendar();
///////////////////////////////////////////////////////////////////////////////
// Event Listners
///////////////////////////////////////////////////////////////////////////////
addTaskBtn.addEventListener('click', gantt.addTaskFromForm, false);
document.getElementById('addDependencyBtn').addEventListener('click', gantt.addDependencyBtn, false);
document.getElementById('addDependencyConfirm').addEventListener('click', function(e){gantt.dependencyDecide(e, true);}, false);
document.getElementById('addDependencyCancel').addEventListener('click', function(e){gantt.dependencyDecide(e, false);}, false);
document.getElementById('popUpSubmitBtn').addEventListener('click', gantt.editTask,false);
