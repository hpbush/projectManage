import React from 'react';

///////////////////////////////////////////////////////////////////////////////
//Define global functions
///////////////////////////////////////////////////////////////////////////////

function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
}

function findSelectionWrapper(startLevel, objKey, selFlag, addFlag, addType, dropObj, delFlag){
  let trail = [];
  let found = false;

  function findSel(currentLevel){
    for(let i = 0; i < currentLevel.contents.length; i++){
      trail.push(currentLevel.contents[i]);
      if(currentLevel.contents[i].key === objKey){
        found = true;

        if(addFlag){
          if(addType === 'folder'){
            currentLevel.contents[i].contents.push(
              dropObj ||
            {
              name: 'New Folder',
              selectStatus: '',
              textBox: true,
              key: generateUUID(),
              contents: [],
              type: 'folder'
            });
          }else{
            currentLevel.contents[i].contents.push({
              name: 'New ' + addType,
              textBox: false,
              key: generateUUID(),
              type: addType
            });
          }
        }

        if(selFlag){
          currentLevel.contents[i].selectStatus = 'selected';
          for(let j = 0; j < currentLevel.contents.length; j++){
            if(j !== i && currentLevel.contents[j].type === 'folder'){
              currentLevel.contents[j].selectStatus = '';
            }
          }
          for(let j = 0; j < currentLevel.contents[i].contents.length; j++){
            if(currentLevel.contents[i].contents[j].type === 'folder'){
              currentLevel.contents[i].contents[j].selectStatus = '';
            }
          }
        }

        if(delFlag){
          currentLevel.contents.splice(i,1);
        }

        break;
      }else{
        if(currentLevel.contents[i].type === 'folder'){
          findSel(currentLevel.contents[i]);
        }
        if(found){
          return trail;
        }
      }
      trail.pop();
    }
    return trail;
  }

  return findSel(startLevel);
}

///////////////////////////////////////////////////////////////////////////////
//Define global variables
///////////////////////////////////////////////////////////////////////////////
let scrollPositions = [];
let folderRoots = [{
  name: 'Projects',
  contents: [],
  selectStatus: '',
  index: 0,
  key: generateUUID()
},{
  name: 'Employees',
  contents: [],
  selectStatus: '',
  index: 1,
  key: generateUUID()
},{
  name: 'Contacts',
  contents: [],
  selectStatus: '',
  index: 2,
  key: generateUUID()
},{
  name: 'Archive',
  contents: [],
  selectStatus: '',
  index: 3,
  key: generateUUID()
}];

///////////////////////////////////////////////////////////////////////////////
//App that will be rendered
///////////////////////////////////////////////////////////////////////////////
class App extends React.Component{
  constructor(){
    super();
    this.state = {
      selectionMap: [],
      customContextMenu: {
        open: false,
        type: null,
        xCoord: null,
        yCoord: null,
        owner: null,
        level: null
      },
      dragAndDrop: {
        objDragging: null,
        objHovering: null
      }
    }
  }

  //////
  //Folder and FileSelection and Creation
  //////
  selectFolderRoot(event){
    if(event.target.getAttribute('class') === 'liSpan'){
      let reactId = event.target.parentNode.dataset.reactid;
      let objKey = reactId.substring(reactId.indexOf("$")+1);
      let selectedObj = {};
      //set and clear selection status for root
      for(let i = 0; i < this.props.folderRoots.length; i++){
        if(this.props.folderRoots[i].key === objKey){
          this.props.folderRoots[i].selectStatus = 'selected';
          //clear select status for child folders
          for(let j = 0; j < this.props.folderRoots[i].contents.length; j++){
            this.props.folderRoots[i].contents[j].selectStatus = '';
          }
          selectedObj = this.props.folderRoots[i];
        }else{
          this.props.folderRoots[i].selectStatus = '';
        }
      }
      this.setState({
        selectionMap: [selectedObj]
      });
    }
  }

  selectFolder(event, cMenuSelected){
    if(typeof cMenuSelected === 'object'|| event.target.getAttribute('class') === 'folderSpan'){
      let reactId = cMenuSelected.key || event.target.parentNode.dataset.reactid;
      let objKey = cMenuSelected.key || reactId.substring(reactId.indexOf("$", reactId.indexOf("$")+1)+1);
      let newSelection = findSelectionWrapper(this.state.selectionMap[0], objKey, true, false, false);
      newSelection.splice(0,0,this.state.selectionMap[0]);
      this.setState({
        selectionMap: newSelection
      });
    }
  }

  newItem(event, type, level, dropObj){
    if(this.state.selectionMap[0] != undefined){
      let endKey = this.state.selectionMap[this.state.selectionMap.length - 1].key;
      if(typeof level === 'number'){
        endKey = this.state.selectionMap[level - 1].key;
      }
      if(this.state.selectionMap.length === 1 || level - 1 === 0){
        //Only selection is root, place folder or file in that root folder
        if(type === 'folder'){
          this.state.selectionMap[0].contents.push(
          dropObj ||
          {
            name: 'New Folder',
            selectStatus: '',
            textBox: true,
            key: generateUUID(),
            contents: [],
            type: 'folder'
          });
        }else{
          this.state.selectionMap[0].contents.push({
            name: 'New ' + type,
            textBox: false,
            key: generateUUID(),
            type: type
          });
        }
      }else{
        findSelectionWrapper(this.state.selectionMap[0], endKey, false, true, type, dropObj);
      }
      this.forceUpdate();
    }
  }

  //////
  //Context Menu Controlls
  //////
  openContextMenu(event){
    event.preventDefault();
    let type = 'Item';
    let owner = {};
    let level = 0;
    if(event.target.className === 'folderLevel'){
      type = 'Div';
      level =  parseInt(event.target.dataset.reactid.substring(event.target.dataset.reactid.indexOf('$') + 1), 10);
    }else{
      let target = event.target;
      let reactId = '';
      if(target.nodeName === 'SPAN'){
        reactId = target.parentNode.dataset.reactid;
      }else if(target.nodeName === 'LI'){
        reactId = target.dataset.reactid;
      }
      let objKey = reactId.substring(reactId.indexOf("$", reactId.indexOf("$")+1)+1);
      let trail = findSelectionWrapper(this.state.selectionMap[0], objKey, false, false, false);
      owner = trail[trail.length-1];
    }

    this.setState({
      customContextMenu:{
        open: true,
        type: type,
        xCoord: event.pageX,
        yCoord: event.pageY,
        owner: owner,
        level: level
      }
    });
  }

  closeContextMenu(event){
    if(this.state.customContextMenu.open){
      if(event.target.className != 'menu' && event.target.parentNode.className != 'menu'){
        this.setState({
          customContextMenu:{
            open: false,
            type: null,
            xCoord: null,
            yCoord: null,
            owner: null
          }
        });
      }
    }
  }

  cMenuFieldFocus(event){
    let target = event.target;
    let reactId = target.parentNode.dataset.reactid;
    let objKey = reactId.substring(reactId.indexOf("$", reactId.indexOf("$")+1)+1);
    let trail = findSelectionWrapper(this.state.selectionMap[0], objKey, false, false, false);
    let r = trail[trail.length - 1];
    this.state.customContextMenu.owner = r;
  }

  cMenuNameChangeConfirm(event){
    let newName = event.target.value;
    this.state.customContextMenu.owner.name = newName;
    this.state.customContextMenu.owner.textBox = false;
    this.forceUpdate();
  }

  cMenuSelectFolder(){
    this.selectFolder(null, this.state.customContextMenu.owner);
  }

  cMenuAddFile(){
    console.log(this.state.customContextMenu.owner);
  }

  //////
  //Drag and Drop
  //////
  dragStartLi(event){
    let target = event.target;
    let reactId = null;
    if(target.nodeName === 'SPAN'){
      reactId = target.parentNode.dataset.reactid;
    }else if(target.nodeName === 'LI'){
      reactId = target.dataset.reactid;
    }
    let objKey = reactId.substring(reactId.indexOf("$", reactId.indexOf("$")+1)+1);
    let trail = findSelectionWrapper(this.state.selectionMap[0], objKey, false, false, false);
    trail = trail[trail.length - 1];
    this.setState({
      dragAndDrop: {
        objDragging: trail,
        objHovering: null
      }
    });
  }

  dragEndLi(){
    this.setState({
      dragAndDrop: {
        objDragging: null,
        objHovering: null
      }
    });
  }

  dragOverLi(event){
    event.preventDefault();
    let target = event.target;
    let reactId = reactId = target.parentNode.dataset.reactid;
    let objKey = reactId.substring(reactId.indexOf("$", reactId.indexOf("$")+1)+1);
    if((this.state.dragAndDrop.objHovering === null || this.state.dragAndDrop.objHovering.key != objKey) && this.state.dragAndDrop.objDragging.key !== objKey){
      let trail = findSelectionWrapper(this.state.selectionMap[0], objKey, false, false, false);
      trail = trail[trail.length - 1];
      this.selectFolder(null, trail);
      this.setState({
        dragAndDrop: {
          objDragging: this.state.dragAndDrop.objDragging,
          objHovering: trail
        }
      });
    }
  }

  dropLi(event){
    event.preventDefault();
    let newItem = this.state.dragAndDrop.objDragging;
    let level =  parseInt(event.target.dataset.reactid.substring(event.target.dataset.reactid.indexOf('$') + 1), 10);

    findSelectionWrapper(this.state.selectionMap[0], newItem.key, false, false, null, null, true);

    this.newItem(null, 'folder', level, newItem);

  }

  //////
  //Component Life Cycle
  //////
  componentWillUpdate(){
    let folderTeirList = document.querySelectorAll('.folderLevel');
    scrollPositions = [];
    for(let i = 0; i < folderTeirList.length; i++){
      scrollPositions.push(folderTeirList[i].scrollTop);
    }
  }

  componentDidUpdate(){
    let folderTeirList = document.querySelectorAll('.folderLevel');
    for(let i = 0; i < folderTeirList.length; i++){
      folderTeirList[i].scrollTop = scrollPositions[i];
    }
    scrollPositions = [];
  }

  componentDidMount(){
    window.addEventListener('click', this.closeContextMenu.bind(this), false);
  }

  render(){
    let styleContextMenu = {
      top: this.state.customContextMenu.yCoord + 10,
      left: this.state.customContextMenu.xCoord + 10
    };
    let that = this;

    return(
      <div>

        <div className = 'col-xs-12'>
          <input id = 'folderSearch' type = 'text'></input>
          <button id = 'addFolderBtn' onClick = {function(){that.newItem(null, 'folder', null, null);}}>New Folder</button>
        </div>

        <div id = 'folderHousing'>

          <div className = 'folderRootsDiv'>
            <ul id = 'folderRoots' onClick = {this.selectFolderRoot.bind(this)}>
              {
                this.props.folderRoots.map((folderRoot) => {
                  return <li key = {folderRoot.key} className = {folderRoot.selectStatus + ' folderLi'}><span className = 'liSpan'>{folderRoot.name}</span></li>
                })
              }
            </ul>
          </div>

          {
            this.state.selectionMap.map((level, i) => {
              return <div key = {i + 1} className = 'folderLevel' onContextMenu = {this.openContextMenu.bind(this)} onDragOver = {function(event){event.preventDefault();}} onDrop = {this.dropLi.bind(this)}>
                <ul onClick = {this.selectFolder.bind(this)}>
                  {
                    this.state.selectionMap[i].contents.map((item) => {
                      if(item.type === 'folder'){
                        if(item.textBox === true){
                          return <li className = {item.selectStatus + ' ' + item.type + 'Li'} key = {item.key}><input className = 'folderNameInput' type = 'text' defaultValue = {item.name} onFocus = {this.cMenuFieldFocus.bind(this)} onBlur = {this.cMenuNameChangeConfirm.bind(this)}></input></li>
                        }else{
                            let draggable = true;
                            if(item.selectStatus === 'selected'){
                              draggable = false;
                            }
                            return( <li draggable = {draggable} onDragStart = {this.dragStartLi.bind(this)} onDragEnd = {this.dragEndLi.bind(this)} className = {item.selectStatus + ' ' + item.type + 'Li'} key = {item.key}>
                                      <span className = 'folderSpan' onDragOver = {this.dragOverLi.bind(this)}>{item.name}</span>
                                    </li>)
                        }
                      }else{
                        if(item.textBox === true){
                          return <li className = {item.type + 'Li'} key = {item.key}><input className = 'folderNameInput' type = 'text' defaultValue = {item.name} ></input></li>
                        }else{
                          return <li draggable = 'tr' className = {item.type + 'Li'} key = {item.key}><span className = 'folderSpan'>{item.name}</span></li>
                        }
                      }
                    })
                  }
                </ul>
              </div>
            })
          }
        </div>

        {
          this.state.customContextMenu.open
            ? this.state.customContextMenu.type === 'Div'
              ? <div id="customContextMenu" className="menu" style = {styleContextMenu}>
                  <ul>
                    <li id="newFolder" onClick = {function(){that.newItem(null, 'folder', that.state.customContextMenu.level, null)}}><span>New Folder</span></li>
                    <li id = "newFile" onClick = {function(){that.newItem(null, that.state.selectionMap[0].name, that.state.customContextMenu.level, null)}}><span>{"Add " + this.state.selectionMap[0].name}</span></li>
                  </ul>
                </div>
              : <div id="customContextMenu" className="menu" style = {styleContextMenu}>
                  <ul>
                    <li id="Rename" onClick = {function(){that.state.customContextMenu.owner.textBox = true;}}><span>Rename</span></li>
                    <li id="Open" onClick = {this.cMenuSelectFolder.bind(this)}><span>Open</span></li>
                  </ul>
                </div>
            : null
        }

      </div>
    );
  }
}
React.render(<App folderRoots = {folderRoots}/>, document.getElementById('app'));
console.log("test");
