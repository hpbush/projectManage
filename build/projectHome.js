let gantt = {
  taskList: [],
  calendar: {
    numDisplayDays: 14,
    startDate: null,
    endDate: null
  },

  buildGantt: function () {
    console.log("buildGantt");
  },

  task: function (name, duration, startDate, dependencies, offset) {
    this.name = name;
    this.duration = duration;
    this.startDate = startDate;
    this.dependencies = dependencies;
    this.offset = offset;
  },

  getFirstTaskStartDate: function () {
    let returnDate = null;
    if (this.taskList.length > 0) {
      returnDate = this.taskList[0].startDate;
    }
    for (let i = 1; i < this.taskList.length; i++) {
      if (this.taskList[i].startDate < returnDate) {
        returnDate = this.taskList[i].startDate;
      }
    }
    console.log(this.calendar);
    return returnDate;
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
    //let startDate = this.getFirstTaskStartDate();
    let startDate = new Date(2016, 10, 1);
    this.calendar.startDate = new Date(startDate);
    this.calendar.endDate = new Date(startDate.getTime() + this.calendar.numDisplayDays * 86400000);
    console.log(startDate);
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
      console.log(i);
      if (this.taskList[i].startDate >= this.calendar.startDate && this.taskList[i].startDate < this.calendar.endDate) {
        console.log('task ' + i);
        let left = (this.taskList[i].startDate.getTime() / 86400000 - this.calendar.startDate.getTime() / 86400000) / this.calendar.numDisplayDays * 100 + '%';
        let style = {
          width: this.taskList[i].duration / this.calendar.numDisplayDays * 100 + '%',
          color: 'red',
          top: 60 * vertOffSet++ + 'px',
          left: left
        };
        this.createDiv(this.taskList[i].name, 'taskDiv', style);
      }
    }
  }

};

gantt.taskList.push(new gantt.task('task1', 1, new Date(2016, 10, 2), null, null));
gantt.taskList.push(new gantt.task('task2', 5, new Date(2016, 10, 1), null, null));
gantt.taskList.push(new gantt.task('task3', 6, new Date(2016, 10, 3), null, null));
gantt.taskList.push(new gantt.task('task3', 6, new Date(2016, 10, 3), null, null));
gantt.taskList.push(new gantt.task('task3', 6, new Date(2016, 10, 3), null, null));
gantt.taskList.push(new gantt.task('task3', 6, new Date(2016, 10, 3), null, null));
gantt.taskList.push(new gantt.task('task3', 6, new Date(2016, 10, 3), null, null));

console.log(gantt.buildCalendar());
console.log(gantt.graphTasks());