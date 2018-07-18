import React from 'react';
import PropTypes from 'prop-types';
import {SortableContainer, SortableElement, SortableHandle} from 'react-sortable-hoc';

// class DirItemInfo extends React.Component {
//   render() {
//     let menuItemTempl = null;
//
//     if (!this.props.item.get('modify')) {
//       menuItemTempl = (
//         <a href="#" onClick={(e) => this.props.onDirClickHandler(e, this.props.index)}>{this.props.dirName}</a>
//       );
//     } else {
//       menuItemTempl = (
//         <div className="modify">
//           <input type="text" ref="reNameDirInpt" defaultValue={this.props.item.get('dirName')} autoFocus="true" onKeyUp={(e) => this.props.onChangeDirFormKeyUp(e)} onFocus={(e) => e.currentTarget.select()} />
//           <button type="submit" onClick={(e) => this.props.onUpdateDirReNameFormSubmit(this.refs.reNameDirInpt)}>apply</button>
//         </div>
//       );
//     }
//
//     return (
//       <li className={(!this.props.getAllMemoListToggleOn && this.props.item.get('actived'))? 'active' : null}>
//         {menuItemTempl}
//         <span className="count" style={{display: (!this.props.item.get('modify'))? 'block' : 'none'}}>{(this.props.count < 1000)? this.props.count : '999+'}</span>
//       </li>
//     );
//   }
// }
//

const DragHandle = SortableHandle(() => <span>:::</span>);
const SortableItem = SortableElement(({dirName, count, isDirFormToggleOn, getAllMemoListToggleOn, onDirClickHandler, onUpdateDirReNameFormSubmit, onChangeDirFormKeyUp, item, sortIndex}) => {
  let menuItemTempl = null;

  if (!item.get('modify')) {
    menuItemTempl = (
      <a href="#" onClick={(e) => onDirClickHandler(e, sortIndex)}>
        {(sortIndex > 0)? <DragHandle /> : null}
        {dirName}
      </a>
    );
  } else {
    menuItemTempl = (
      <div className="modify">
        <input type="text" ref={(input) => this.reNameDirInpt = input} defaultValue={item.get('dirName')} autoFocus="true" onKeyUp={(e) => onChangeDirFormKeyUp(e)} onFocus={(e) => e.currentTarget.select()} onBlur={(e) => e.currentTarget.focus()} />
        <button type="submit" onClick={(e) => onUpdateDirReNameFormSubmit(this.reNameDirInpt)}>apply</button>
      </div>
    );
  }

  return (
    <li className={(!getAllMemoListToggleOn && item.get('actived'))? 'active' : null}>
      {menuItemTempl}
      <span className="count" style={{display: (!item.get('modify'))? 'block' : 'none'}}>{(count < 1000)? count : '999+'}</span>
    </li>
  );
});

const SortableList = SortableContainer(({isDirFormToggleOn, getAllMemoListToggleOn, onDirClickHandler, onUpdateDirReNameFormSubmit, onChangeDirFormKeyUp, items}) => {
  return (
    <ul>
      {
        items.map((item, i) => (
          <SortableItem
            dirName={item.get('dirName')}
            count={item.get('count')}
            isDirFormToggleOn={isDirFormToggleOn}
            getAllMemoListToggleOn={getAllMemoListToggleOn}
            onDirClickHandler={onDirClickHandler}
            onUpdateDirReNameFormSubmit={onUpdateDirReNameFormSubmit}
            onChangeDirFormKeyUp={onChangeDirFormKeyUp}
            item={item}
            index={i}
            sortIndex={i}
            key={`item-${i}`}
          />
        ))
      }
    </ul>
  );
});

class MemoDir extends React.Component {
  constructor(props) {
    super(props);

    this.createDirFormShow = this.createDirFormShow.bind(this);
    this.createDirFormKeyUp = this.createDirFormKeyUp.bind(this);
    this.updateDirFormSubmit = this.updateDirFormSubmit.bind(this);
    this.updateDirReNameFormSubmit = this.updateDirReNameFormSubmit.bind(this);
    this.onSortEnd = this.onSortEnd.bind(this);
  }

  componentDidMount() {
    this.$memoDir = this.refs.memoDir;
    this.$createDirForm = this.refs.createDirForm;
    this.$createDirInpt = this.refs.createDirInpt;
  }

  // shouldComponentUpdate(prevProps, prevState) {
  //   //console.log( prevProps );
  //   //console.log( prevState );
  //   //return this.props.user !== prevProps.user;
  //   return (document.querySelectorAll('#memoDir .modify').length > 0)? false : true;
  // }

  createDirFormShow() {
    this.props.onCreateDirFormShow({
      $memoDir: this.$memoDir,
      $createDirInpt: this.$createDirInpt
    });
  }

  createDirFormKeyUp(e) {
    this.props.onCreateDirFormKeyUp({
      $event: e,
      $createDirForm: this.$createDirForm
    });
  }

  updateDirFormSubmit(e) {
    e.preventDefault();

    this.props.onUpdateDirFormSubmit({
      $createDirForm: this.$createDirForm,
      dirInptNameVal: this.$createDirInpt.value
    });
  }

  updateDirReNameFormSubmit(e) {
    e.preventDefault();
  }

  onSortEnd({oldIndex, newIndex}) {
    if (newIndex === 0) { return; }

    this.props.onDirMemoSortableUpdate(oldIndex, newIndex);
  }

  render() {
    let totalCountArea = null;

    if (this.props.getDirItemData.size > 1) {
      totalCountArea = (
        <strong className={(this.props.getAllMemoListToggleOn)? 'active' : null} onClick={(e) => this.props.onAllClickHandler(e)}>모든 메모 <span className="count">{this.props.getTotalMemoCount()}</span></strong>
      );
    }

    return (
      <section ref="memoDir" id="memoDir" className="memo-dir split split-horizontal" style={{display: (this.props.getDirBarToggleOn)? 'flex': 'none'}}>
        <h1>나의 Windows</h1>
        <nav>
          {totalCountArea}
          <form ref="dirForm" method="POST" onSubmit={this.updateDirReNameFormSubmit}>
          {/*
          <ul>
            {
              this.props.getDirItemData.map((item, i) => {
                return (
                  <DirItemInfo
                    dirName={item.get('dirName')}
                    count={item.get('count')}
                    isDirFormToggleOn={this.props.isDirFormToggleOn}
                    getAllMemoListToggleOn={this.props.getAllMemoListToggleOn}
                    onDirClickHandler={this.props.onDirClickHandler}
                    onUpdateDirReNameFormSubmit={this.props.onUpdateDirReNameFormSubmit}
                    onChangeDirFormKeyUp={this.props.onChangeDirFormKeyUp}
                    item={item}
                    index={i}
                    key={i}
                  />
                );
              })
            }
          </ul>
          */}
          <SortableList
            isDirFormToggleOn={this.props.isDirFormToggleOn}
            getAllMemoListToggleOn={this.props.getAllMemoListToggleOn}
            onDirClickHandler={this.props.onDirClickHandler}
            onUpdateDirReNameFormSubmit={this.props.onUpdateDirReNameFormSubmit}
            onChangeDirFormKeyUp={this.props.onChangeDirFormKeyUp}
            items={this.props.getDirItemData}
            onSortEnd={this.onSortEnd}
            useDragHandle={true}
            distance={1}
            lockAxis={'y'}
            helperClass={'memo-dir-sortable'}
            useWindowAsScrollContainer={true}
          />
          </form>
          <div className="create-dir" style={{display:(this.props.isDirFormToggleOn)? 'block' : 'none'}}>
            <form ref="createDirForm" method="POST" onSubmit={this.updateDirFormSubmit}>
              <legend>Add Folder</legend>
              <input type="text" ref="createDirInpt" defaultValue='새로운 폴더' onKeyUp={(e) => this.createDirFormKeyUp(e)} onFocus={(e) => {if (this.props.isDirFormToggleOn) e.currentTarget.select()}} onBlur={(e) => {if (this.props.isDirFormToggleOn) e.currentTarget.focus()}} />
              <button type="submit">add</button>
            </form>
          </div>
        </nav>
        <button type="button" id="btnCreateNewFolder" className="btn-new" onClick={this.createDirFormShow}>새로운 폴더</button>
      </section>
    );
  }
}

MemoDir.propTypes = {
  getDirItemData: PropTypes.object.isRequired,
  isDirFormToggleOn: PropTypes.bool,
  getTotalMemoCount: PropTypes.func,
  onCreateDirFormShow: PropTypes.func
};

MemoDir.defaultProps = {
  getDirItemData: {},
  isDirFormToggleOn: false,
  getTotalMemoCount: () => console.warn('getTotalMemoCount not defined'),
  onCreateDirFormShow: () => console.warn('onCreateDirFormShow not defined')
};

export default MemoDir;
