import React from 'react';

function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
}


export default class FolderStructure extends React.Component{
  constructor(){
    super();
    this.state = {
      selectLevel: []
    };
  }

  findSelectedFolder(key){

  }

  componentWillReceiveProps(nextProp){
    this.setState({
      selectLevel: [nextProp.selectedContents]
    });
  }

  selectFolder(event){
    if(event.target.getAttribute("class") === "folderSpan"){
      let reactId = event.target.parentNode.dataset.reactid;
      let selectedKey = reactId.substring(reactId.indexOf('$',reactId.indexOf('$')+1)+1);
      let currentLevel = this.state.selectLevel.length;
      console.log(selectedKey);
      //let nextLevel = this.state.selectLevel.push(this.state.selectLevel[currentLevel-1].obj.contents[])
      //this.setState({
        //selectLevel: selectLevel.push(this.state.selectLevel[])
      //});
    }
  }


  render(){
    let selectedRootContents = [];
    let i = 0;
    if(this.state.selectLevel[0] != null){
      selectedRootContents = this.state.selectLevel[0].obj.contents;
    }

    return(
      <div id = 'subFolderContainer' className = 'col-xs-8'>
        <ul onClick = {this.selectFolder.bind(this)}>
          {
            this.state.selectLevel.map((folderLevel) => {
              i++;
              return <div key = {generateUUID()}>
                {
                  this.state.selectLevel[i-1].obj.contents.map((item) => {
                    return <li className = 'folderLi' key = {item.key}><span className = 'folderSpan'>{item.name}</span></li>
                  })
                }
              </div>
            })
          }
        </ul>
      </div>
    );
  }
}
