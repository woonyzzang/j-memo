import React from 'react';

import Moment from 'moment';
// import update from 'react-addons-update';
import {Map, List} from 'immutable';
import Split from '../lib/split.min';
import {arrayMove} from 'react-sortable-hoc';
// import {connect, bindActionCreators} from 'react-redux';
import {connect} from 'react-redux';
import * as actions from '../actions';

import Menu from './Menu';
import MemoDir from './MemoDir';
import MemoList from './MemoList';
import MemoView from './MemoView';
import MemoContextMenu from './MemoContextMenu';

import Store from '../../Store';

/** [D] electron prod */
import electron, {ipcRenderer} from 'electron';
//import path from 'path';
import fs from 'fs';

class App extends React.Component {
  constructor(props) {
    super(props);
    Moment.locale('ko');

    const storeData = (() => {
      try {
        const userDataPath = (electron.app || electron.remote.app).getPath('userData');
        const dataFilePath = userDataPath + '/user-preferences.json';

        if (fs.existsSync(dataFilePath)) {
          return JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
        }
      } catch (error) {
        console.error(error);
        return {};
      }
    })();

    const storeDataReProcessing = () => {
      let newDirItemData = [];

      storeData.dirItemData.forEach((elem, index, array) => {
        const memoListArr = [];

        elem.memoList.forEach((elem, index, array) => {
          if (elem.context.length === 0 || elem.context === '') {
            elem.year = Moment().format('LL');
            elem.date = Moment().format('LT');
          }

          memoListArr.push(Map(elem));
        });

        elem.memoList = List(memoListArr);
        newDirItemData.push(Map(elem));
      });

      newDirItemData = List(newDirItemData);

      return newDirItemData;
    };

    this.state = {
      dirItemData: storeDataReProcessing(),
      // dirItemData: List([ //데이터 더미
      //   Map({
      //     dirName: '메모',
      //     modify: false,
      //     memoList: List([
      //       Map({
      //         title: '새로운 메모',
      //         year: Moment().format('LL'),
      //         date: Moment().format('LT'),
      //         addtext: '추가 텍스트 없음',
      //         context: '',
      //         active: true,
      //         lock: false,
      //         sticky: false
      //       })
      //       // Map({
      //       //   title: '새로운 메모2',
      //       //   year: 'YYMMDD',
      //       //   date: '0:00',
      //       //   addtext: '추가 텍스트 없음',
      //       //   context: '',
      //       //   active: false,
      //       //   lock: false
      //       //   sticky: false
      //       // })
      //     ]),
      //     count: 1,
      //     childs: null,
      //     actived: true
      //   })
      //   // Map({
      //   //   dirName: '메모2',
      //   //   modify: false,
      //   //   memoList: List([
      //   //     Map({
      //   //       title: '새로운 메모',
      //   //       year: 'YYMMDD',
      //   //       date: '0:00',
      //   //       addtext: '추가 텍스트 없음',
      //   //       context: '',
      //   //       active: true,
      //   //       lock: false
      //   //       sticky: false
      //   //     })
      //   //   ]),
      //   //   count: 1,
      //   //   childs: null,
      //   //   actived: false
      //   // })
      // ]),
      toolsBarToggleOn: storeData.config.toolsBarChk,
      utilBarToggleOn: storeData.config.utilBarChk,
      dirBarToggleOn: storeData.config.dirBarChk,
      styleMemoEditorToggleOn: storeData.config.styleMemoEditorChk,
      // utilBarToggleOn: true, // 유틸메뉴 영역 노출 활성화 여부
      // dirBarToggleOn: true, // 새로운 폴더 영역 노출 활성화 여부
      allMemoListToggleOn: false, //모든 메모 노출 활성화 여부
      createDirFormToggleOn: false, // 새로운 폴더 폼 활성화 여부
      memoDirContextmenu: { // 나의 메모 컨텍스트 옵션
        visible: false,
        reNameDisabled: false,
        delDisabled: false
      },
      memoListContextmenu: {  // 새로운 메모 컨텍스트 옵션
        visible: false,
        delDisabled: false,
        fixDisabled: false,
        isLock: false,
        isMemoItemContextEmpty: true
      }
    };

    this.currentContextmenuTarget = null;

    this.toggleUtilBar = this.toggleUtilBar.bind(this);
    this.toggleDirBar = this.toggleDirBar.bind(this);
    this.coreSettings = this.coreSettings.bind(this);
    this.getTotalMemoCount = this.getTotalMemoCount.bind(this);
    this.allClickHandler = this.allClickHandler.bind(this);
    this.dirClickHandler = this.dirClickHandler.bind(this);
    this.createDirFormShow = this.createDirFormShow.bind(this);
    this.createDirFormKeyUp = this.createDirFormKeyUp.bind(this);
    this.updateDirFormSubmit = this.updateDirFormSubmit.bind(this);
    this.listClickHandler = this.listClickHandler.bind(this);
    this.listDbClickHandler = this.listDbClickHandler.bind(this);
    this.allListClickHandler = this.allListClickHandler.bind(this);
    this.changeUpdateView = this.changeUpdateView.bind(this);
    this.contextMenu = this.contextMenu.bind(this);
    this.changeDirReName = this.changeDirReName.bind(this);
    this.changeDirFormKeyUp = this.changeDirFormKeyUp.bind(this);
    this.createDirFormShowTrigger = this.createDirFormShowTrigger.bind(this);
    this.updateDirReNameFormSubmit = this.updateDirReNameFormSubmit.bind(this);
    this.dirDelete = this.dirDelete.bind(this);
    this.createMemoItem = this.createMemoItem.bind(this);
    this.memoItemLock = this.memoItemLock.bind(this);
    this.memoItemDelete = this.memoItemDelete.bind(this);
    this.dirMemoSortableUpdate = this.dirMemoSortableUpdate.bind(this);

    // 새로운 폴더 단축키 생성 (일렉트론 메뉴)
    ipcRenderer.on('menu:nFolder', () => {
      this.createDirFormShowTrigger();
    });

    // 새로운 메모 단축키 생성 (일렉트론 메뉴)
    ipcRenderer.on('menu:nMemo', () => {
      this.createMemoItem();
    });

    // 폴더 이름 변경 단축키 (일렉트론 메뉴)
    ipcRenderer.on('menu:rFolder', () => {
      this.changeDirReName();
    });

    // 새로운 폴더 단축키 삭제 (일렉트론 메뉴)
    ipcRenderer.on('menu:dFolder', () => {
      this.dirDelete();
    });

    // 새로운 메모 단축키 삭제 (일렉트론 메뉴)
    ipcRenderer.on('menu:dMemo', () => {
      this.memoItemDelete();
    });

    // 환경설정 (일렉트론 메뉴)
    ipcRenderer.on('menu:settings', (e, item) => {
      this.setState({
        utilBarToggleOn: item.utilBarChk,
        dirBarToggleOn: item.dirBarChk,
        styleMemoEditorToggleOn: item.styleMemoEditorChk
      });
    });

    // 유틸 메뉴바 영역 토글 (일렉트론 메뉴)
    ipcRenderer.on('menu:toggleUtilBar', () => {
      this.toggleUtilBar();
    });

    // 유틸 메뉴 > 새로운 폴더 메뉴 바 토글 (일렉트론 메뉴)
    ipcRenderer.on('menu:toggleDirBar', () => {
      this.toggleDirBar();
    });

    // 스티커 메모 - 종료
    ipcRenderer.on('stickyNote:hide', (e, item) => {
      let newDirItemData = [];

      this.state.dirItemData.forEach((elem, index, array) => {
        if (item.activedIndex === index) {
          const dirItemData2JS = elem.toJS();
          const memoListArr = [];

          elem.get('memoList').forEach((elem, index, array) => {
            let memoList2JS = elem.toJS();

            memoList2JS = Object.assign({}, memoList2JS, {
              sticky: (item.activeIndex === index)? false : elem.get('sticky')
            });

            memoList2JS = Map(memoList2JS);
            memoListArr.push(memoList2JS);
          });

          dirItemData2JS.memoList = List(memoListArr);
          newDirItemData.push(Map(dirItemData2JS));
        } else {
          newDirItemData.push(elem);
        }
      });

      this.setState({
        dirItemData: List(newDirItemData)
      });

      // ipcMain Process 업데이트 데이터 전송
      ipcRenderer.send('storeData:update', List(newDirItemData).toJS());
    });
  }

  /** 컴포넌트가 DOM 위에 만들어지기 전에 실행 */
  componentWillMount() {
    let newDirItemData = [];

    this.state.dirItemData.forEach((elem, index, array) => {
      newDirItemData.push(elem.set('count', elem.get('memoList').size));
    });

    this.setState({
      dirItemData: List(newDirItemData)
    });

    document.addEventListener('auxclick', (e) => {
      if (e.which === 2) { e.preventDefault(); }
    }, false);
    document.removeEventListener('contextmenu', this._handleContextMenu);
  }

  /** 컴포넌트가 DOM이 렌더링 된 후 실행 */
  componentDidMount() {
    // 분할 드래그 앤 드롭 기능
    Split(['#memoDir', '#memoList', '#memoView'], {
      sizes: [22, 34, 44],
      minSize: [160, 260, 400],
      gutterSize: 8,
      snapOffset: 0,
      onDrag: function(callback) {
        // const $memoDir = document.querySelector('#memoDir');
        // if (parseInt(getComputedStyle($memoDir).width, 10) === 160) {}
      },
      onDragStart: function(callback) {
        // console.log(callback);
        // console.log(this);
      },
      onDragEnd: function(callback) {
        // console.log(callback);
        // console.log(this);
      }
    });

    // window.addEventListener('resize', function() {
    //   if (window.innerHeight < 360) {
    //     return;
    //   }
    // }, false);
  }

  /**
   * toggleDirBar
   * @description - 유틸 메뉴바 영역 토글
   */
  toggleUtilBar() {
    this.setState({
      utilBarToggleOn: !this.state.utilBarToggleOn
    });
  }

  /**
   * toggleDirBar
   * @description - 유틸메뉴 > 새로운 폴더 메뉴 바 영역 노출/숨김 토글
   */
  toggleDirBar() {
    const $memoDir = document.querySelector('#memoDir');

    // memoDir 사이즈 조절 드래그 방지
    (!this.state.dirBarToggleOn)? $memoDir.nextSibling.style.display = 'block' : $memoDir.nextSibling.style.display = 'none';

    this.setState({
      dirBarToggleOn: !this.state.dirBarToggleOn
    });
  }

  /**
   * toggleDirBar
   * @description - 유틸메뉴 > 코어 셋팅
   */
  coreSettings() {
    // ipcMain Process 데이터 전송
    ipcRenderer.send('util:settings');
  }

  /**
   * getTotalMemoCount
   * @description - 전체 메모 갯수값 가져오기
   * @return {Number} - 메모 전체 카운트 값 반환
   */
  getTotalMemoCount() {
    let totalCount = 0;

    this.state.dirItemData.forEach((elem, index, array) => {
      totalCount += elem.get('count');
    });

    return totalCount;
  }

  /**
   * allClickHandler
   * @description - 모든 메모 클릭 이벤트 핸들러
   */
  allClickHandler(e) {
    const dirItemDataIsModify = this.state.dirItemData.filter((elem, index, array) => {
      if (elem.get('modify')) { return elem; }
    });

    if (e.currentTarget.classList.contains('active') || this.state.createDirFormToggleOn || dirItemDataIsModify.size > 0) { return; }

    let newDirItemData = [];

    this.state.dirItemData.forEach((elem, index, array) => {
      if (!elem.get('actived')) {
        const dirItemData2JS = elem.toJS();
        const memoListArr = [];

        elem.get('memoList').forEach((elem, index, array) => {
          let memoList2JS = elem.toJS();

          memoList2JS = Object.assign({}, memoList2JS, {
            active: false
          });

          memoList2JS = Map(memoList2JS);
          memoListArr.push(memoList2JS);
        });

        dirItemData2JS.memoList = List(memoListArr);
        newDirItemData.push(Map(dirItemData2JS));
      } else {
        //const dirItemData = elem.set('actived', false);

        //newDirItemData.push(dirItemData);
        newDirItemData.push(elem);
      }
    });

    this.setState({
      dirItemData: List(newDirItemData),
      //allMemoListToggleOn: !this.state.allMemoListToggleOn
      allMemoListToggleOn: true
    });
  }

  /**
   * dirClickHandler
   * @description - 폴더 리스트 클릭 이벤트 핸들러
   * @param {Object} e - 이벤트 객체
   * @param {Number} activeIndex - 폴더 리스트 활성화 인덱스 값
   */
  dirClickHandler(e, activeIndex) {
    e.preventDefault();

    const dirItemDataIsModify = this.state.dirItemData.filter((elem, index, array) => {
      if (elem.get('modify')) { return elem; }
    });

    if (this.state.createDirFormToggleOn || dirItemDataIsModify.size > 0) { return; }

    let newDirItemData = [];

    this.state.dirItemData.forEach((elem, index, array) => {
      if (index === activeIndex) {
        newDirItemData.push(elem.set('actived', true));
      } else {
        newDirItemData.push(elem.set('actived', false));
      }
    });

    this.setState({
      dirItemData: List(newDirItemData),
      allMemoListToggleOn: false
    }, () => {
      let newDirItemData = [];

      this.state.dirItemData.forEach((elem, index, array) => {
        if (elem.get('actived')) {
          const dirItemData2JS = elem.toJS();
          const memoListArr = [];

          const isListItemActiveFilter = elem.get('memoList').filter(function(elem, index, array) {
            return elem.get('active');
          });

          if (isListItemActiveFilter.size === 0) {
            elem.get('memoList').forEach((elem, index, array) => {
              let memoList2JS = elem.toJS();

              memoList2JS = Object.assign({}, memoList2JS, {
                active: (index === 0)? true : false
              });

              memoList2JS = Map(memoList2JS);
              memoListArr.push(memoList2JS);
            });

            dirItemData2JS.memoList = List(memoListArr);
            newDirItemData.push(Map(dirItemData2JS));
          } else {
            newDirItemData.push(elem);
          }
        } else {
          newDirItemData.push(elem);
        }
      });

      this.setState({
        dirItemData: List(newDirItemData)
      });
    });
  }

  /**
   * createDirFormShow
   * @description - 새로운 폴더 입력창 노출
   * @param {Object} options.$memoDir - 폴더 리스트 래퍼 영역 셀렉터
   * @param {Object} options.$createDirInpt -새로운 폴더 입력창 셀렉터
   */
  createDirFormShow(options) {
    const $dirItems = options.$memoDir.querySelectorAll('nav ul>li');

    if ($dirItems.length > 1 && options.$memoDir.querySelectorAll('nav>strong')[0].classList.contains('active')) {
      options.$memoDir.querySelectorAll('nav>strong')[0].classList.remove('active');
    }

    $dirItems.forEach(function(elem, index, array) {
      if (elem.classList.contains('active')) { elem.classList.remove('active'); }
    });

    let newDirItemData = [];

    this.state.dirItemData.forEach((elem, index, array) => {
      newDirItemData.push(elem.set('modify', false));
    });

    if (!this.state.createDirFormToggleOn) {
      this.setState({
        dirItemData: List(newDirItemData),
        // createDirFormToggleOn: !this.state.createDirFormToggleOn,
        createDirFormToggleOn: true
      });

      window.setTimeout(() => {
        options.$createDirInpt.focus();
      }, 0);
    }
  }

  /**
   * createDirFormKeyUp
   * @description - 새로운 폴더 키업(취소) 이벤트 핸들러
   * @param {Object} options.$ - 새로운 폴더 폼 셀렉터
   * @param {String} options.dirInptNameVal - 새로운 폴더 입력창 입력값
   */
  createDirFormKeyUp(options) {
    switch (options.$event.keyCode) {
      case 27: //ESC
        if (window.confirm(`"${options.$event.currentTarget.value}" 폴더 생성을 취소 하시겠습니까?`)) {
          const $dirItems = document.querySelector('#memoDir').querySelectorAll('nav ul>li');

          this.state.dirItemData.forEach((elem, index, array) => {
            if (elem.get('actived')) {
              $dirItems[index].classList.add('active');
            }
          });

          this.setState({
            allMemoListToggleOn: false,
            createDirFormToggleOn: false
          });

          options.$createDirForm.reset();
        }
      break;
    }
  }

  /**
   * updateDirFormSubmit
   * @description - 새로운 폴더 생성 폼 전송
   * @param {Object} options.$createDirForm - 새로운 폴더 폼 셀렉터
   * @param {String} options.dirInptNameVal - 새로운 폴더 입력창 입력값
   */
  updateDirFormSubmit(options) {
    // 새로운 폴더 네이밍값 빈 문자열 체크
    if (options.dirInptNameVal.trim().length === 0) {
      alert('Please enter a new folder name value.');

      return;
    }

    // 새로운 폴더 네이밍값 중복 체크
    let duplicateCheck = false;

    this.state.dirItemData.forEach((elem, index, array) => {
      if (elem.get('dirName') === options.dirInptNameVal) {
        duplicateCheck = true;

        alert(`A folder name with the name "${options.dirInptNameVal}" already exists.`);

        return;
      }
    });

    if (duplicateCheck) { return; }

    const newDirItemData = [];

    this.state.dirItemData.forEach((elem, index, array) => {
      newDirItemData.push(elem.set('actived', false));
    });

    newDirItemData.push(
      Map({
        dirName: options.dirInptNameVal,
        modify: false,
        memoList: List([
          Map({
            title: '새로운 메모',
            year: Moment().format('LL'),
            date: Moment().format('LT'),
            addtext: '추가 텍스트 없음',
            context: '',
            active: true,
            lock: false,
            sticky: false
          })
        ]),
        count: 1,
        childs: null,
        actived: true
      })
    );

    this.setState({
      dirItemData: List(newDirItemData),
      allMemoListToggleOn: false,
      createDirFormToggleOn: false
    }, () => {
      options.$createDirForm.reset();
      const $memoDir = document.querySelector('#memoDir');

      $memoDir.querySelectorAll('nav ul>li.active')[0].querySelectorAll('a')[0].click();
      // $memoDir.querySelectorAll('nav>strong').classList.remove('active');
    });

    // ipcMain Process 업데이트 데이터 전송
    ipcRenderer.send('storeData:update', List(newDirItemData).toJS());
  }

  /**
   * listClickHandler
   * @description - 메모 리스트 클릭 이벤트 핸들러
   * @param {Object} e - 이벤트 객체
   * @param {Number} activeIndex - 메모 아이템 리스트 활성화 인덱스 값
   */
  listClickHandler(e, activeIndex) {
    e.preventDefault();

    let newDirItemData = [];

    this.state.dirItemData.forEach((elem, index, array) => {
      if (elem.get('actived')) {
        const dirItemData2JS = elem.toJS();
        const memoListArr = [];

        elem.get('memoList').forEach((elem, index, array) => {
          let memoList2JS = elem.toJS();

          memoList2JS = Object.assign({}, memoList2JS, {
            active: (index === activeIndex)? true : false
          });

          memoList2JS = Map(memoList2JS);
          memoListArr.push(memoList2JS);
        });

        dirItemData2JS.memoList = List(memoListArr);
        newDirItemData.push(Map(dirItemData2JS));
      } else {
        newDirItemData.push(elem);
      }
    });

    this.setState({
      dirItemData: List(newDirItemData)
    });
  }

  /* TODO: 더블 클릭 시 메모 새창 유지 테스트 */
  listDbClickHandler(e) {
    e.preventDefault();

    if (e.currentTarget.dataset.stickyMode === 'true') { return; }

    let newDirItemData = [];
    let stickyNote = {
      activedIndex: 0,
      activeIndex: 0,
      context: ''
    };

    this.state.dirItemData.forEach((elem, index, array) => {
      if (elem.get('actived')) {
        stickyNote.activedIndex = index;

        const dirItemData2JS = elem.toJS();
        const memoListArr = [];

        elem.get('memoList').forEach((elem, index, array) => {
          if (elem.get('active')) {
            stickyNote.activeIndex = index;
            stickyNote.context = elem.get('context');
          }

          let memoList2JS = elem.toJS();

          memoList2JS = Object.assign({}, memoList2JS, {
            sticky: (elem.get('active'))? true : elem.get('sticky')
          });

          memoList2JS = Map(memoList2JS);
          memoListArr.push(memoList2JS);
        });

        dirItemData2JS.memoList = List(memoListArr);
        newDirItemData.push(Map(dirItemData2JS));
      } else {
        newDirItemData.push(elem);
      }
    });

    this.setState({
      dirItemData: List(newDirItemData)
    });

    // ipcRenderer Process 메모 에디터 텍스트 내용 받기
    ipcRenderer.send('stickyNote:add', stickyNote);

    // ipcMain Process 업데이트 데이터 전송
    ipcRenderer.send('storeData:update', List(newDirItemData).toJS());
  }

  /**
   * allListClickHandler
   * @description - 모든메모 리스트 클릭 이벤트 핸들러
   * @param {Object} e - 인벤트 객체
   */
  allListClickHandler(e) {
    e.preventDefault();

    const $currentTarget = e.currentTarget;
    let newDirItemData = [];

    this.state.dirItemData.forEach((elem, index, array) => {
      let dirItemData2JS = elem.toJS();
      const memoListArr = [];

      dirItemData2JS = Object.assign({}, dirItemData2JS, {
        actived: ($currentTarget.dataset.parentDirName === dirItemData2JS.dirName)? true : false
      });

      elem.get('memoList').forEach((elem, index, array) => {
        let memoList2JS = elem.toJS();

        memoList2JS = Object.assign({}, memoList2JS, {
          active: (
            $currentTarget.dataset.parentDirName === dirItemData2JS.dirName
            && parseInt($currentTarget.dataset.targetIdx, 10) === index
          )? true : false
        });

        memoList2JS = Map(memoList2JS);
        memoListArr.push(memoList2JS);
      });

      dirItemData2JS.memoList = List(memoListArr);
      newDirItemData.push(Map(dirItemData2JS));
    });

    this.setState({
      dirItemData: List(newDirItemData)
    });
  }

  /**
   * changeUpdateView
   * @description - 메모 뷰 텍스트 업데이트 변경
   * @param {String} options.title - 메모 타이틀
   * @param {String} options.year - 메모 작성 년도
   * @param {String} options.date - 메모 작성 시간
   * @param {String} options.addtext - 메모 추가 텍스트
   * @param {String} options.context - 메모 전체 텍스트
   * @log - https://velopert.com/3486
   */
  changeUpdateView(options) {
    const newDirItemData = [];
    let memoViewriteChangeWatch = false;
    let memoListAtiveIndex = 0;

    this.state.dirItemData.forEach((elem, index, array) => {
      if (elem.get('actived')) {
        const dirItemData2JS = elem.toJS();
        let memoListArr = [];

        elem.get('memoList').forEach((elem, index, array) => {
          let memoListObj = {};

          if (elem.get('active')) {
            let memoList2JS = elem.toJS();

            // memoView 텍스트 변경 감시
            if (options.context === '<p><br></p>' || elem.get('context').length === options.context.length){
              memoViewriteChangeWatch = false;
            } else {
              memoViewriteChangeWatch = true;
              memoListAtiveIndex = index;
            }

            memoList2JS = Object.assign({}, memoList2JS, {
              title: options.title,
              year: options.year,
              date: options.date,
              addtext: options.addtext,
              context: options.context,
              lock: options.lock
            });

            memoListObj = Map(memoList2JS);
          } else {
            memoListObj = elem;
          }

          memoListArr.push(memoListObj);
        });

        if (memoViewriteChangeWatch) { memoListArr = arrayMove(memoListArr, memoListAtiveIndex, 0); }

        dirItemData2JS.memoList = List(memoListArr);
        newDirItemData.push(Map(dirItemData2JS));
      } else {
        newDirItemData.push(elem);
      }
    });


    // let newDirItemData = this.state.dirItemData;
    //
    // newDirItemData = newDirItemData.toArray();
    // newDirItemData = arrayMove(memoListArr, memoListAtiveIndex, 0);
    // this.setState({
    //   dirItemData: List(newDirItemData)
    // });
    //
    // // ipcMain Process 업데이트 데이터 전송
    // ipcRenderer.send('storeData:update', List(newDirItemData).toJS());


    this.setState({
      dirItemData: List(newDirItemData)
    });

    // ipcMain Process 업데이트 데이터 전송
    ipcRenderer.send('storeData:update', List(newDirItemData).toJS());
  }

  /**
   * getNodeIndex
   * @description - 부모 노드 인덱스값 가져오기
   * @param {Object} selector - DOMNode 셀렉터
   * @return {Number} - Parent DOMNode 인덱스값 반환
   */
  getNodeIndex(selector) {
    for (let i = 0; i < selector.parentNode.children.length; i++) {
      if (selector.parentNode.children[i] === selector) {
        return i;
      }
    }
  }

  /**
   * contextMenu
   * @description - 메모 컨텍스트메뉴
   * @param {Object} options.$memoDirContextmenu - 나의 메모 컨텍스트 메뉴
   * @param {Object} options.$memoListContextmenu - 메모 리스트 켄텍스트 메뉴
   * @log - https://velopert.com/3486
   */
  contextMenu(options) {
    const contextmenuStateInit = () => {
      this.setState({
        memoDirContextmenu: {
          visible: false,
          reNameDisabled: true,
          delDisabled: true
        },
        memoListContextmenu: {
          visible: false,
          delDisabled: true,
          fixDisabled: true,
          isLock: false,
          isMemoItemContextEmpty: true
        }
      });
    };

    // 컨텍스트 이벤트 핸들러
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();

      if (e.target.closest('section') === null) { return; }

      contextmenuStateInit();
      this.currentContextmenuTarget = e.target;

      const $target = e.target;
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      const clickX = e.clientX;
      const clickY = e.clientY;
      let top = 0;
      let right = 0;
      let bottom = 0;
      let left = 0;

      switch ($target.closest('section').id) {
        case 'memoDir':
          const dirItemDataIsModify = this.state.dirItemData.filter((elem, index, array) => {
            if (elem.get('modify')) { return elem; }
          });

          if (e.target.tagName === 'H1'
          || e.target.tagName === 'STRONG'
          || e.target.tagName === 'BUTTON'
          || this.state.createDirFormToggleOn
          || dirItemDataIsModify.size > 0) { return; }

          if (this.currentContextmenuTarget.tagName === 'A') {
            const $memoDir = document.querySelector('#memoDir');
            const $memoDirItem = $memoDir.querySelectorAll('nav ul>li')[this.getNodeIndex(this.currentContextmenuTarget.parentNode)];

            $memoDirItem.querySelectorAll('a')[0].click();
          }

          this.setState({
            memoDirContextmenu: {
              visible: true,
              reNameDisabled: ($target.tagName !== 'A' || this.getNodeIndex($target.parentNode) === 0)? true : false,
              delDisabled: ($target.tagName !== 'A' || this.getNodeIndex($target.parentNode) === 0)? true : false
            }
          }, () => {
            const $memoDirContextmenu = options.$memoDirContextmenu;
            const memoDirContextmenuWid = $memoDirContextmenu.offsetWidth;
            const memoDirContextmenuHgt = $memoDirContextmenu.offsetHeight;
            top = (screenH - clickY) > memoDirContextmenuHgt;
            right = (screenW - clickX) > memoDirContextmenuWid;
            // bottom = !top;
            bottom = (screenH - memoDirContextmenuHgt) < clickY;
            left = !right;

            if (top) { $memoDirContextmenu.style.top = `${clickY + 2}px`; }
            if (right) { $memoDirContextmenu.style.left = `${clickX + 2}px`; }
            if (bottom) { $memoDirContextmenu.style.top = `${clickY - memoDirContextmenuHgt - 2}px`; }
            if (left) { $memoDirContextmenu.style.left = `${clickX - memoDirContextmenuWid - 2}px`; }
          });
          this.changeDirActive();
        break;
        case 'memoList':
          const $memoDir = document.querySelector('#memoDir');
          const $dirItems = $memoDir.querySelectorAll('nav ul>li');

          if ($dirItems.length > 1 && $memoDir.querySelectorAll('nav>strong')[0].classList.contains('active')) { return; }

          this.setState({
            memoListContextmenu: {
              visible: true,
              // tododelDisabled: (this.currentContextmenuTarget.closest('a') !== null)? (this.currentContextmenuTarget.closest('ol').childNodes.length === 1) : (this.currentContextmenuTarget.closest('a') === null),
              delDisabled: (this.currentContextmenuTarget.closest('a') !== null && this.currentContextmenuTarget.closest('ol').childNodes.length === 1)? (this.getNodeIndex(this.currentContextmenuTarget.closest('a').parentNode) === 0) : (this.currentContextmenuTarget.closest('a') === null),
              fixDisabled: (this.currentContextmenuTarget.closest('a') !== null)? true : false,
              isLock: (this.currentContextmenuTarget.closest('a') !== null && this.currentContextmenuTarget.closest('li').querySelectorAll('.lock input[type=checkbox]')[0].value === 'on')? true : false,
              isMemoItemContextEmpty: (this._isMemoItemContextEmpty())? true : false
            }
          }, () => {
            const $memoListContextmenu = options.$memoListContextmenu;
            const memoListContextmenuWid = $memoListContextmenu.offsetWidth;
            const memoListContextmenuHgt = $memoListContextmenu.offsetHeight;
            top = (screenH - clickY) > memoListContextmenuHgt;
            right = (screenW - clickX) > memoListContextmenuWid;
            bottom = (screenH - memoListContextmenuHgt) < clickY;
            left = !right;

            if (top) { $memoListContextmenu.style.top = `${clickY + 2}px`; }
            if (right) { $memoListContextmenu.style.left = `${clickX + 2}px`; }
            if (bottom) { $memoListContextmenu.style.top = `${clickY - memoListContextmenuHgt - 2}px`; }
            if (left) { $memoListContextmenu.style.left = `${clickX - memoListContextmenuWid - 2}px`; }
          });
          this.changeMemoListActive();
        break;
      }
    }, false);

    document.addEventListener('click', contextmenuStateInit, false);
  }

  /**
   * changeDirActive
   * @description - dir 메뉴 활성화 변경
   */
  changeDirActive() {
    if (this.currentContextmenuTarget.tagName !== 'A' && this.state.memoDirContextmenu.delDisabled) { return; }

    let newDirItemData = [];

    this.state.dirItemData.forEach((elem, index, array) => {
      let memoListArr = [];

      if (this.getNodeIndex(this.currentContextmenuTarget.parentNode) === index) {
        memoListArr = elem.set('actived', true);
      } else {
        memoListArr = elem.set('actived', false);
      }

      newDirItemData.push(memoListArr);
    });

    this.setState({
      dirItemData: List(newDirItemData)
    });
  }

  /**
   * changeMemoListActive
   * @description - dir 메모 리스트 활성화 변경
   */
  changeMemoListActive() {
    if (this.currentContextmenuTarget.closest('a') === null) { return; }

    let newDirItemData = [];

    this.state.dirItemData.forEach((elem, index, array) => {
      if (elem.get('actived')) {
        let memoListArr = [];

        elem.get('memoList').forEach((elem, index, array) => {
          let memoListObj = {};

          if (this.getNodeIndex(this.currentContextmenuTarget.closest('a').parentNode) === index) {
            memoListObj = elem.set('active', true);
          } else {
            memoListObj = elem.set('active', false);
          }

          memoListArr.push(memoListObj);
        });

        memoListArr = elem.set('memoList', List(memoListArr));
        newDirItemData.push(memoListArr);
      } else {
        newDirItemData.push(elem);
      }
    });

    this.setState({
      dirItemData: List(newDirItemData)
    });
  }

  /**
   * changeDirReName
   * @description - dir 메뉴 이름 변경
   */
  changeDirReName() {
    //if (this.state.memoDirContextmenu.delDisabled) { return; }
    let newDirItemData = [];

    this.state.dirItemData.forEach((elem, index, array) => {
      let memoListArr = [];

      if (elem.get('actived')) {
        memoListArr = elem.set('modify', true);
      } else {
        memoListArr = elem.set('modify', false);
      }

      newDirItemData.push(memoListArr);
    });

    this.setState({
      dirItemData: List(newDirItemData)
    });

    window.setTimeout(() => {
      const $memoDir = document.querySelector('#memoDir');
      $memoDir.querySelectorAll('.modify>input[type=text]')[0].focus();
    }, 0);
  }

  /**
   * changeDirFormKeyUp
   * @description - dir 메뉴 이름 변경 키업(취소) 이벤트 핸들러
   */
  changeDirFormKeyUp(e) {
    switch (e.keyCode) {
      case 27: //ESC
        let newDirItemData = [];

        this.state.dirItemData.forEach((elem, index, array) => {
          newDirItemData.push(elem.set('modify', false));
        });

        this.setState({
          dirItemData: List(newDirItemData)
        });
      break;
    }
  }

  /**
   * updateDirReNameFormSubmit
   * @description - 이름 변경 폴더 생성 폼 전송
   */
  updateDirReNameFormSubmit(reNameDirInpt) {
    // 새로운 폴더 네이밍값 빈 문자열 체크
    if (reNameDirInpt.value.trim().length === 0) {
      alert('Please enter a new folder name value.');

      return;
    }

    // 새로운 폴더 네이밍값 중복 체크
    let duplicateCheck = false;

    this.state.dirItemData.forEach((elem, index, array) => {
      if (elem.get('dirName') === reNameDirInpt.value) {
        duplicateCheck = true;

        alert(`A folder name with the name "${reNameDirInpt.value}" already exists.`);

        return;
      }
    });

    if (duplicateCheck) { return; }

    let newDirItemData = [];

    this.state.dirItemData.forEach((elem, index, array) => {
      let dirItemData2JS = {};

      if (elem.get('actived')) {
        dirItemData2JS = elem.merge({
          dirName: reNameDirInpt.value,
          modify: false
        });
      } else {
        dirItemData2JS = elem;
      }

      newDirItemData.push(dirItemData2JS);
    });

    this.setState({
      dirItemData: List(newDirItemData)
    });

    // ipcMain Process 업데이트 데이터 전송
    ipcRenderer.send('storeData:update', List(newDirItemData).toJS());
  }

  /**
   * createDirFormShowTrigger
   * @description - 나의 메모 컨텍스트메뉴 새료운 폴더 생성
   */
  createDirFormShowTrigger() {
    document.querySelector('#btnCreateNewFolder').click();
  }

  /**
   * dirDelete
   * @description - dir 폴더 삭제
   */
  dirDelete() {
    if (document.querySelector('#memoDir').querySelectorAll('li').length === 1) { return false; }

    this.currentContextmenuTarget = document.querySelector('#memoDir').querySelectorAll('li.active>a')[0];
    //if (this.state.memoDirContextmenu.delDisabled) { return; }

    window.setTimeout(() => {
      if (window.confirm(`"${this.currentContextmenuTarget.textContent}"을(를) 삭제하겠습니까?\n선택한 폴더와 하위 모든 메모가 삭제됩니다.`)) {
        let activedIndex = 0;

        this.state.dirItemData.forEach((elem, index, array) => {
          if (elem.get('actived')) {
            activedIndex = index;

            return;
          }
        });

        let newDirItemData = [];

        newDirItemData = this.state.dirItemData.delete(activedIndex);

        let newDirItemDataRedefine = [];

        newDirItemData.forEach((elem, index, array) => {
          newDirItemDataRedefine.push((index === (activedIndex - 1))? elem.set('actived', true) : elem);
        });

        this.setState({
          dirItemData: List(newDirItemDataRedefine)
        });

        // ipcMain Process 업데이트 데이터 전송
        ipcRenderer.send('storeData:update', List(newDirItemDataRedefine).toJS());
      }
    }, 0);
  }

  /**
   * _isMemoItemContextEmpty
   * @description - 새로운 메모 아이템 비어있는 아이템 체크
   * @return {Boolean} - 비어있는 아이템 유무 판단 후 반환
   */
  _isMemoItemContextEmpty() {
    let flag = false;

    this.state.dirItemData.forEach((elem, index, array) => {
      if (elem.get('actived')) {
        elem.get('memoList').forEach((elem, index, array) => {
          if (elem.get('context') === '<p><br></p>' || elem.get('context').length === 0) {
            flag = true;

            return;
          }
        });
      }
    });

    return flag;
  }

  /**
   * createMemoItem
   * @description - 새로운 메모 아이템 생성
   */
  createMemoItem() {
    if (this._isMemoItemContextEmpty()) { return; }

    let newDirItemData = [];

    this.state.dirItemData.forEach((elem, index, array) => {
      if (elem.get('actived')) {
        const dirItemData2JS = elem.toJS();
        const memoListArr = [
          Map({
            title: '새로운 메모',
            year: Moment().format('LL'),
            date: Moment().format('LT'),
            addtext: '추가 텍스트 없음',
            context: '',
            active: true,
            lock: false,
            sticky: false
          })
        ];

        elem.get('memoList').forEach((elem, index, array) => {
          let memoList2JS = elem.toJS();

          memoList2JS = Object.assign({}, memoList2JS, {
            active: false
          });

          memoList2JS = Map(memoList2JS);
          memoListArr.push(memoList2JS);
        });

        dirItemData2JS.memoList = List(memoListArr);
        dirItemData2JS.count = memoListArr.length;
        newDirItemData.push(Map(dirItemData2JS));
      } else {
        newDirItemData.push(elem);
      }
    });

    this.setState({
      dirItemData: List(newDirItemData)
    });

    // ipcMain Process 업데이트 데이터 전송
    ipcRenderer.send('storeData:update', List(newDirItemData).toJS());
  }

  /**
   * memoItemLock
   * @description - 새로운 메모 잠금 || 해제
   */
  memoItemLock() {
    window.setTimeout(() => {
      let activedIndex = 0;
      let activeIndex = 0;

      this.state.dirItemData.forEach((elem, index, array) => {
        if (elem.get('actived')) {
          activedIndex = index;

          elem.get('memoList').forEach((elem, index, array) => {
            if (elem.get('active')) {
              activeIndex = index;

              return;
            }
          });
        }
      });

      let newDirItemData = [];

      this.state.dirItemData.get(activedIndex).get('memoList').forEach((elem, index, array) => {
        newDirItemData.push((index === activeIndex)? elem.set('lock', !elem.get('lock')) : elem.set('lock', elem.get('lock')));
      });

      newDirItemData = List(newDirItemData);
      newDirItemData = this.state.dirItemData.get(activedIndex).set('memoList', newDirItemData);

      let newDirItemDataRedefine = [];

      this.state.dirItemData.forEach((elem, index, array) => {
        newDirItemDataRedefine.push((elem.get('actived'))? newDirItemData : elem);
      });

      this.setState({
        dirItemData: List(newDirItemDataRedefine)
      });

      // ipcMain Process 업데이트 데이터 전송
      ipcRenderer.send('storeData:update', List(newDirItemDataRedefine).toJS());
    }, 250);
  }

  /** TODO
   * memoItemDelete
   * @description - 새로운 메모 아이템 삭제
   */
  memoItemDelete() {
    if (document.querySelector('#memoList').querySelectorAll('li').length === 1) { return false; }

    this.currentContextmenuTarget = document.querySelector('#memoList').querySelectorAll('li.active>a>h2')[0];
    //if (this.state.memoListContextmenu.delDisabled) { return; }

    window.setTimeout(() => {
      if (window.confirm(`"${this.currentContextmenuTarget.closest('a').querySelectorAll('h2')[0].textContent}" 을(를) 삭제하겠습니까?\n선택한 메모가 삭제됩니다.`)) {
        let activedIndex = 0;
        let activeIndex = 0;

        this.state.dirItemData.forEach((elem, index, array) => {
          if (elem.get('actived')) {
            activedIndex = index;

            elem.get('memoList').forEach((elem, index, array) => {
              if (elem.get('active')) {
                activeIndex = index;

                return;
              }
            });
          }
        });

        const applyActiveIndex = (activeIndex === 0)? activeIndex + 1 : activeIndex - 1;
        let newDirItemData = [];

        this.state.dirItemData.get(activedIndex).get('memoList').forEach((elem, index, array) => {
          // newDirItemData.push((index === (activeIndex - 1))? elem.set('active', true) : elem.set('active', false));
          newDirItemData.push((index === applyActiveIndex)? elem.set('active', true) : elem.set('active', false));
        });

        newDirItemData = List(newDirItemData).delete(activeIndex);
        newDirItemData = this.state.dirItemData.get(activedIndex).set('memoList', newDirItemData);
        newDirItemData = newDirItemData.set('count', newDirItemData.get('count') - 1);

        let newDirItemDataRedefine = [];

        this.state.dirItemData.forEach((elem, index, array) => {
          newDirItemDataRedefine.push((elem.get('actived'))? newDirItemData : elem);
        });

        this.setState({
          dirItemData: List(newDirItemDataRedefine)
        });

        // ipcMain Process 업데이트 데이터 전송
        ipcRenderer.send('storeData:update', List(newDirItemDataRedefine).toJS());
      }
    }, 250);
  }

  /** TODO
   * dirMemoSortableUpdate
   * @description - 새로운 메모 순서 변경(Sortable) 업데이트
   */
  dirMemoSortableUpdate(oldIndex, newIndex) {
    let newDirItemData = this.state.dirItemData;

    newDirItemData = newDirItemData.toArray();
    newDirItemData = arrayMove(newDirItemData, oldIndex, newIndex);
    this.setState({
      dirItemData: List(newDirItemData)
    });

    // ipcMain Process 업데이트 데이터 전송
    ipcRenderer.send('storeData:update', List(newDirItemData).toJS());
  }

  render() {
    return (
        <main id="app" className={(this.state.toolsBarToggleOn)? 'app on' : 'app'}>
          <Menu
            getUtilBarToggleOn={this.state.utilBarToggleOn}
            onToggleDirBar={this.toggleDirBar}
            onCreateDirFormShowTrigger={this.createDirFormShowTrigger}
            onCreateMemoItem={this.createMemoItem}
            onDirDelete={this.dirDelete}
            onMemoItemDelete={this.memoItemDelete}
            onCoreSettings={this.coreSettings}
          />
          {/*onPlus={this.props.handleReduxTest}
          tree={this.state.dirItemData}*/}
          {/*<strong>{this.props.number}</strong>*/}
          <div id="container" className="container">
            <MemoDir
              getDirItemData={this.state.dirItemData}
              getDirBarToggleOn={this.state.dirBarToggleOn}
              getAllMemoListToggleOn={this.state.allMemoListToggleOn}
              isDirFormToggleOn={this.state.createDirFormToggleOn}
              getTotalMemoCount={this.getTotalMemoCount}
              onAllClickHandler={this.allClickHandler}
              onDirClickHandler={this.dirClickHandler}
              onCreateDirFormShow={this.createDirFormShow}
              onCreateDirFormKeyUp={this.createDirFormKeyUp}
              onUpdateDirFormSubmit={this.updateDirFormSubmit}
              onChangeDirFormKeyUp={this.changeDirFormKeyUp}
              onUpdateDirReNameFormSubmit={this.updateDirReNameFormSubmit}
              onDirMemoSortableUpdate={this.dirMemoSortableUpdate}
            />
            <MemoList
              getDirItemData={this.state.dirItemData}
              getAllMemoListToggleOn={this.state.allMemoListToggleOn}
              onListClickHandler={(this.state.allMemoListToggleOn)? this.allListClickHandler : this.listClickHandler}
              onListDbClickHandler={this.listDbClickHandler}
              isDirFormToggleOn={this.state.createDirFormToggleOn}
            />
            <MemoView
              getDirItemData={this.state.dirItemData}
              getStyleMemoEditorToggleOn={this.state.styleMemoEditorToggleOn}
              onChangeUpdateView={this.changeUpdateView}
            />
          </div>
          <MemoContextMenu
            contextMenu={this.contextMenu}
            memoDirContextmenu={this.state.memoDirContextmenu}
            memoListContextmenu={this.state.memoListContextmenu}
            isDirFormToggleOn={this.state.createDirFormToggleOn}
            onChangeDirReName={this.changeDirReName}
            onDirDelete={this.dirDelete}
            onCreateDirFormShowTrigger={this.createDirFormShowTrigger}
            onCreateMemoItem={this.createMemoItem}
            onMemoItemLock={this.memoItemLock}
            onMemoItemDelete={this.memoItemDelete}
          />
        </main>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    number: state.counter.number,
    color: state.ui.color
  };
}

const mapDispatchToProps = (dispatch) => {
  //return bindActionCreators(actions, dispatch);
  return {
    handleReduxTest: () => {
      dispatch(actions.reduxTEST());
    },
    handleSetColor: (color) => {
      dispatch(actions.setColor(color));
    }
  };
}

//export default App;
export default connect(mapStateToProps, mapDispatchToProps)(App);
// this.props.store.getState().counter.nember
