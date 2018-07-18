import React from 'react';

class MemoContextMenu extends React.Component {
  componentDidMount() {
    this.props.contextMenu({
      $memoDirContextmenu: this.memoDirContextmenu,
      $memoListContextmenu: this.memoListContextmenu
    });
  }

  render() {
    return (
      <div className="memo-contextmenu">
        {/* 나의 메모 컨텍스트 */}
        <div ref={(ref) => {this.memoDirContextmenu = ref}} className={(this.props.memoDirContextmenu.visible)? ['menucontext', 'on'].join(' ') : 'menucontext'}>
          <div className="menuitem-group">
            <div className="menuitem"><a className={(this.props.memoDirContextmenu.reNameDisabled)? 'disabled' : null} onClick={(this.props.memoDirContextmenu.reNameDisabled)? null : this.props.onChangeDirReName}>폴더 이름 변경...</a></div>
            <div className="menuitem"><a className={(this.props.memoDirContextmenu.delDisabled)? 'disabled' : null} onClick={(this.props.memoDirContextmenu.delDisabled)? null : this.props.onDirDelete}>폴더 삭제...</a></div>
          </div>
          <div className="menuitem"><a className={(this.props.isDirFormToggleOn)? 'disabled' : null} onClick={this.props.onCreateDirFormShowTrigger}>새로운 폴더...</a></div>
        </div>
        {/* //나의 메모 컨텍스트 */}

        {/* 새로운 메모 컨텍스트 */}
        <div ref={(ref) => {this.memoListContextmenu = ref}} className={(this.props.memoListContextmenu.visible)? ['menucontext', 'on'].join(' ') : 'menucontext'}>
          <div className="menuitem"><a className={(this.props.memoListContextmenu.delDisabled)? 'disabled' : null} onClick={(this.props.memoListContextmenu.delDisabled)? null : this.props.onMemoItemDelete}>삭제</a></div>
          <div className="menuitem-group" style={{display: (this.props.memoListContextmenu.fixDisabled)? 'block' : 'none'}}>
            {/*<div className="menuitem"><a>메모 고정</a></div>*/}
            <div className="menuitem"><a onClick={this.props.onMemoItemLock}>{(!this.props.memoListContextmenu.isLock)? '메모 잠금' : '잠금 제거'}</a></div>
          </div>
          <div className="menuitem"><a className={(this.props.memoListContextmenu.isMemoItemContextEmpty)? 'disabled' : null} onClick={(this.props.memoListContextmenu.isMemoItemContextEmpty)? null : this.props.onCreateMemoItem}>새로운 메모</a></div>
        </div>
        {/* //새로운 메모 컨텍스트 */}
      </div>
    );
  }
}

export default MemoContextMenu;
