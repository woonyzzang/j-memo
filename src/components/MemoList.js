import React from 'react';
import Moment from 'moment';

class ListItem extends React.Component {
  render() {
    const dirItemDataInfo = this.props.item.get('info');
    let parentDirTempl = null;

    if ((typeof dirItemDataInfo) !== 'undefined') {
      parentDirTempl = (<div className="parent-dir">{dirItemDataInfo.parentDirName}</div>);
    }

    return (
      <li className={(this.props.item.get('active'))? 'active' : null}>
        <a href="#"
          data-parent-dir-name={(parentDirTempl !== null)? dirItemDataInfo.parentDirName : null}
          data-target-idx={(parentDirTempl !== null)? dirItemDataInfo.targetIdx : null}
          data-sticky-mode={(this.props.sticky)? true : false}
          // data-sticky-xpos="auto"
          // data-sticky-ypos="auto"
          onClick={(e) => this.props.onListClickHandler(e, this.props.index)}
          onDoubleClick={(e) => this.props.onListDbClickHandler(e)}>
          <h2>{this.props.title}</h2>
          <div className="info">
            <time>{this.props.date}</time>
            <p>{(this.props.lock)? '잠김' : this.props.addtext}</p>
          </div>
          {parentDirTempl}
        </a>
        <div className="lock">
          <label>
            <input type="checkbox" checked={this.props.lock} value={(this.props.lock)? 'on' : 'off'} />
            <span>{(this.props.lock)? '메모 잠금' : '잠금 제거'}</span>
          </label>
        </div>
      </li>
    );
  }
}

class MemoList extends React.Component {
  componentWillMount() {
    Moment.locale('ko');
    //console.log( this.props.getDirItemData );
  }

  // shouldComponentUpdate(prevProps, prevState) {
  //   return prevProps.users !== this.props.users;
  // }

  // 활성화 데이터 재가공
  activeDirItemData() {
    for (const [index, elem] of this.props.getDirItemData.entries()) {
      if (elem.get('actived')) { return elem; }
    }
  }

  // memoList 데이터 재가공
  allDirItemData() {
    const allDirMemoArr = [];

    this.props.getDirItemData.forEach((elem, index, array) => {
      const dirName = elem.get('dirName');

      elem.get('memoList').forEach((elem, index, array) => {
        const newMemoList = elem.set('info', {
          parentDirName: dirName,
          targetIdx: index
        });

        allDirMemoArr.push(newMemoList);
      });
    });

    return allDirMemoArr;
  }

  render() {
    let dirDatas = [];
    let listItem = null;

    dirDatas = (this.props.getAllMemoListToggleOn)? this.allDirItemData() : this.activeDirItemData().get('memoList');

    //if (typeof this.activeDirItemData() !== 'undefined') {
    listItem = (
      <ol>
        {
          dirDatas.map((item, i) => {
            return (
              <ListItem
                title={item.get('title')}
                date={item.get('date')}
                addtext={item.get('addtext')}
                lock={item.get('lock')}
                sticky={item.get('sticky')}
                getAllMemoListToggleOn={this.props.getAllMemoListToggleOn}
                onListClickHandler={this.props.onListClickHandler}
                onListDbClickHandler={this.props.onListDbClickHandler}
                item={item}
                index={i}
                key={i}
              />
            );
          })
        }
      </ol>
    );
    //}

    return (
      <section id="memoList" className="memo-list split split-horizontal">
        {listItem}
      </section>
    );
  }
}

export default MemoList;
