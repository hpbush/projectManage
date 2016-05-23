import React from 'react';

let myMenu:ContextMenu = new ContextMenu();

function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
}

let folderRoots = [{
  name: 'Projects',
  contents: [],
  selectStatus: '',
  key: generateUUID()
},{
  name: 'Employees',
  contents: [],
  selectStatus: '',
  key: generateUUID()
},{
  name: 'Contacts',
  contents: [],
  selectStatus: '',
  key: generateUUID()
},{
  name: 'Archive',
  contents: [],
  selectStatus: '',
  key: generateUUID()
}];

class App extends React.Component{
  constructor(){
    super();
    this.state = {
      selectionMap: []
    };
  }

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

  selectFolder(event){
    if(event.target.getAttribute('class') === 'folderSpan'){
      let reactId = event.target.parentNode.dataset.reactid;
      let objKey = reactId.substring(reactId.indexOf("$", reactId.indexOf("$")+1)+1);

      let found = false;
      let trail = [];
      function findSelection(currentLevel){
        for(let i = 0; i < currentLevel.contents.length; i++){
          trail.push(currentLevel.contents[i]);
          if(currentLevel.contents[i].key === objKey){
            currentLevel.contents[i].selectStatus = 'selected';
            found = true;
            //loop through remaining siblings and clear the selected selectStatus
            for(let j = 0; j < currentLevel.contents.length; j++){
              if(j !== i){
                currentLevel.contents[j].selectStatus = '';
              }
            }
            //loop through children and clear selected selectStatus
            for(let j = 0; j < currentLevel.contents[i].contents.length; j++){
              currentLevel.contents[i].contents[j].selectStatus = '';
            }
            break;
          }else{
            if(currentLevel.contents[i].contents.length > 0){
              findSelection(currentLevel.contents[i]);
              if(found){
                break;
              }
            }
          }
          trail.pop();
        }
        return trail;
      };
      let newSelection = findSelection(this.state.selectionMap[0]);
      newSelection.splice(0,0,this.state.selectionMap[0]);
      this.setState({
        selectionMap: newSelection
      });
    }
  }

  newFolder(event){
    if(this.state.selectionMap[0] != undefined){
      let found = false;
      let r = {};
      let endKey = this.state.selectionMap[this.state.selectionMap.length - 1].key;
      function findSelection(selectedRoot){
        for(let i = 0; i < selectedRoot.contents.length; i++){
          if(selectedRoot.contents[i].key === endKey){
            found = true;
            selectedRoot.contents[i].contents.push({
              name: 'New Folder',
              selectStatus: '',
              key: generateUUID(),
              contents: []
            });
            r = selectedRoot.contents[i];
            break;
          }else{
            if(selectedRoot.contents[i].contents.length > 0){
              findSelection(selectedRoot.contents[i]);
              if(found){
                break;
              }
            }
          }
        }
        return r;
      };

      let objKey = this.state.selectionMap[0].key;
      let selectedPropIndex = NaN;
      for(let i = 0; i < this.props.folderRoots.length; i++){
        if(this.props.folderRoots[i].key === objKey){
          selectedPropIndex = i;
          break;
        }
      }
      if(selectedPropIndex != NaN){
        if(this.state.selectionMap[this.state.selectionMap.length - 1] === this.state.selectionMap[0]){
          this.props.folderRoots[selectedPropIndex].contents.push({
            name: 'New Folder',
            selectStatus: '',
            key: generateUUID(),
            contents: []
          });
        }else{
          findSelection(this.props.folderRoots[selectedPropIndex]);
        }
        let oldMap = this.state.selectionMap;
        this.setState({
          selectionMap: oldMap
        });
      }else{
        console.log('weird error');
      }
    }
  }

  changeName(event){
    let newName = event.target.value;
    if (newName !== ''){
      let reactId = event.target.parentNode.dataset.reactid;
      let endKey = reactId.substring(reactId.indexOf("$", reactId.indexOf("$")+1)+1);

      let found = false;
      let r = {};
      function findSelection(selectedRoot){
        for(let i = 0; i < selectedRoot.contents.length; i++){
          if(selectedRoot.contents[i].key === endKey){
            found = true;
            r = selectedRoot.contents[i];
            break;
          }else{
            if(selectedRoot.contents[i].contents.length > 0){
              findSelection(selectedRoot.contents[i]);
              if(found){
                break;
              }
            }
          }
        }
        return r;
      };

      let selectedPropIndex = NaN;
      for(let i = 0; i < this.props.folderRoots.length; i++){
        if(this.props.folderRoots[i].key === this.state.selectionMap[0].key){
          selectedPropIndex = i;
          break;
        }
      }
      let objectToChange = findSelection(this.props.folderRoots[selectedPropIndex]);
      objectToChange.name = newName;
      this.forceUpdate();
    }
  }

  rightClick(event){
    event.preventDefault();
    console.log('hello world');
  }

  componentDidUpdate(){
    //console.log(this.state.selectionMap);
  }

  render(){
    return(
      <div>

        <div className = 'col-xs-12'>
          <input id = 'folderSearch' type = 'text'></input>
          <button id = 'addFolderBtn' onClick = {this.newFolder.bind(this)}>New Folder</button>
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
              return <div key = {generateUUID()} className = 'folderLevel'>
                <ul onClick = {this.selectFolder.bind(this)}>
                  {
                    this.state.selectionMap[i].contents.map((item) => {
                      if(item.name === ''){
                        return <li className = {item.selectStatus + ' folderLi'} key = {item.key}><input className = 'folderNameInput' type = 'text' onBlur = {this.changeName.bind(this)}></input></li>
                      }else{
                        return <li onContextMenu = {this.rightClick.bind(this)} className = {item.selectStatus + ' folderLi'} key = {item.key}><span className = 'folderSpan'>{item.name}</span></li>
                      }
                    })
                  }
                </ul>
              </div>
            })
          }

        </div>

      </div>
    );
  }
}

React.render(<App folderRoots = {folderRoots}/>, document.getElementById('app'));
