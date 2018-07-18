import React from 'react';

class Menu extends React.Component {
  render() {
    return (
      <div id="menu" className="menu" style={{display: (this.props.getUtilBarToggleOn)? 'block': 'none'}}>
        <span className="group">
          <button type="button" title="Toggle Folder Bar" className="btn-toggle-dir" onClick={this.props.onToggleDirBar}><span>폴더토글</span></button>
        </span>
        <span className="group">
          <button type="button" title="New Folder [Ctrl+Shift+N]" className="btn-ndir" onClick={this.props.onCreateDirFormShowTrigger}><span>폴더생성</span></button>
          <button type="button" title="Delete Folde [Ctrl+Shift+D]" className="btn-rdir" onClick={this.props.onDirDelete}><span>폴더삭제</span></button>
        </span>
        <span className="group">
          <button type="button" title="New Memo [Ctrl+N]" className="btn-nmemo" onClick={this.props.onCreateMemoItem}><span>메모생성</span></button>
          <button type="button" title="Delete Memo [Ctrl+D]" className="btn-rmemo" onClick={this.props.onMemoItemDelete}><span>메모삭제</span></button>
          {/*<button type="button" title="Private">암호</button>*/}
        </span>
        {/*
        <span className="group">
          <button type="button" title="Search">검색</button>
        </span>
        */}
        <span className="group">
          <button type="button" title="Core Setting [Ctrl+Comma]" className="btn-core-set" onClick={this.props.onCoreSettings}><span>환경설정</span></button>
        </span>
      </div>
    );
  }
}

export default Menu;
