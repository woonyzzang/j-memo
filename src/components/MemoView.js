import React from 'react';
import ReactQuill, {Quill, Mixin, Toolbar} from 'react-quill';
import Moment from 'moment';
// import 'react-quill/dist/quill.snow.css';

class MemoView extends React.Component {
  constructor(props) {
    super(props);

    this.modules = {
      toolbar: [
        // [{'header': [1, 2, false]}],
        // ['bold', 'italic', 'underline','strike', 'blockquote'],
        // [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
        // ['link', 'image'],
        // [{'color': []}, {'background': []}],
        // // [{'font': []}],
        // [{'align': []}],
        // ['clean']

        //[{'header': [1, 2, 3, 4, 5, 6, false]}],
        [{'header': [1, 2, 3, 4, false]}],
        // ['bold', 'italic', 'underline', 'strike', 'blockquote'], // toggled buttons
        [{'color': []}, {'background': []}], // dropdown with defaults from theme
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        // [{'header': 1 }, {'header': 2}], // custom button values
        [{'list': 'ordered'}, {'list': 'bullet'}],
        // [{'script': 'sub'}, {'script': 'super'}], // superscript/subscript
        // [{'indent': '-1'}, {'indent': '+1'}], // outdent/indent
        // [{'direction': 'rtl'}], // text direction
        // [{'size': ['small', false, 'large', 'huge']}],  // custom dropdown
        // [{'font': []}],
        // [{'align': []}],
        [{'indent': '-1'}, {'indent': '+1'}, {'align': []}],
        ['link', 'image'],
        ['clean'] // remove formatting button
      ]
    };
    // this.formats = [
    //   'header',
    //   'bold', 'italic', 'underline', 'strike', 'blockquote',
    //   'list', 'bullet', 'indent',
    //   'link', 'image',
    //   'color', 'background'
    // ];

    // this.state = {
    //   editorRemoveTag: false
    // };

    this.currentItem = null;

    // this.handleKeyDown = this.handleKeyDown.bind(this);
    this.focusViewHandler = this.focusViewHandler.bind(this);
    this.changeUpdateView = this.changeUpdateView.bind(this);
  }

  // componentWillMount() {}
  // componentDidMount() {}

  focusViewHandler() {
    const $memoContextmenu = document.querySelector('.memo-contextmenu');
    const $menucontext = $memoContextmenu.querySelectorAll('.menucontext');

    $menucontext.forEach((elem, index, array) => {
      if (elem.classList.contains('on')) { elem.classList.remove('on'); }
    });
  }

  changeUpdateView(editorValue) {
    // 어플리케이션 구동시 에디터 텍스트 값 비교 감지(querySelectorAll Error 방지)
    if (this.currentItem.get('context').length === editorValue.length ) { return; }

    // const currentValue = e.target.textContent;
    // const currentFilterValue = currentValue.filter(String);
    // https://github.com/zenoamaro/react-quill
    let currentValue = this.refs.textEditor.querySelectorAll('.ql-editor')[0].innerText;
    currentValue = currentValue.split(/[\n]/m);
    const currentFilterValue = currentValue.filter(String);

    //let editorContextValue = '';
    // if (this.state.editorRemoveTag) {
    //   editorContextValue = editorValue.replace(/<br\/>/igm, '\n'); // br태그 개행으로 변경
    //   editorContextValue = editorContextValue.replace(/<(\/)?([a-zA-Z]*)(\s[a-zA-Z]*=[^>]*)?(\s)*(\/)?>/ig, ''); // html 태그 삭제 정규식
    // }

    this.props.onChangeUpdateView({
      title: (typeof currentFilterValue[0] === 'undefined' || currentFilterValue[0].trim().length === 0)? '새로운 메모' : currentFilterValue[0],
      year: (this.currentItem.get('context') === editorValue)? this.currentItem.get('year') : Moment().format('LL'),
      date: (this.currentItem.get('context') === editorValue)? this.currentItem.get('date') : Moment().format('LT'),
      addtext: (typeof currentFilterValue[1] === 'undefined' || currentFilterValue[1].trim().length === 0)? '추가 텍스트 없음' : currentFilterValue[1],
      // context: (this.state.editorRemoveTag)? editorContextValue : editorValue,
      context: editorValue,
      lock: this.currentItem.get('lock'),
      sticky: this.currentItem.get('sticky')
    });

    // if (editorContextValue.length > 0) {
    //   this.setState({
    //     editorRemoveTag: false
    //   });
    // }
  }

  // handleKeyDown(e) {
  //   const charCode = String.fromCharCode(e.which).toLowerCase();
  //
  //   // if (e.ctrlKey && charCode === 'c') {
  //   //   console.log('Ctrl + C pressed');
  //   // } else if(e.ctrlKey && charCode === 'v') {
  //   //   console.log('Ctrl + V pressed');
  //   // } else if(e.ctrlKey && charCode === 's') {
  //   //   e.preventDefault();
  //   //   console.log('Ctrl + S pressed');
  //   // }
  //   //
  //   // // For MAC we can use metaKey to detect cmd key
  //   // if (e.metaKey && charCode === 'c') {
  //   //   console.log('Cmd + C pressed');
  //   // } else if(e.metaKey && charCode === 'v') {
  //   //   console.log('Cmd + V pressed');
  //   // } else if(e.metaKey && charCode === 's') {
  //   //   e.preventDefault();
  //   //   console.log('Cmd + S pressed');
  //   // }
  //
  //   if (e.ctrlKey && charCode === 'v' || e.metaKey && charCode === 'v') {
  //     this.setState({
  //       editorRemoveTag: true
  //     });
  //   }
  // }

  render() {
    const currentActiveAt = {
      dirItemIndex: 0,
      memoListItemIndex: 0
    };

    this.props.getDirItemData.forEach((elem, index, array) => {
      if (elem.get('actived')) {
        currentActiveAt.dirItemIndex = index;

        elem.get('memoList').forEach((elem, index, array) => {
          if (elem.get('active')) {
            currentActiveAt.memoListItemIndex = index;
          }
        });
      }
    });

    this.currentItem = this.props.getDirItemData.get(currentActiveAt.dirItemIndex).get('memoList').get(currentActiveAt.memoListItemIndex);

    return (
      <section id="memoView" className={this.currentItem.get('lock')? 'memo-view memo-view-lock split split-horizontal' : 'memo-view split split-horizontal'}>
        <form id="memoForm" method="POST">
        <fieldset>
          <legend>Memo Area</legend>
          <time>{`${this.currentItem.get('year')} ${this.currentItem.get('date')}`}</time>
          {/*
            <div contentEditable="true" dangerouslySetInnerHTML={{__html: currentItem.get('context')}}></div>
            <textarea cols="30" rows="10" value={currentItem.get('context')} onKeyPress={this.handleKeyPress} onChange={this.changeUpdateView}></textarea>
          */}
          <div ref="textEditor" className={(this.props.getStyleMemoEditorToggleOn)? 'text-editor style-editor' : 'text-editor'}>
            {/* formats={this.formats} */}
            <ReactQuill
              theme="snow"
              modules={this.modules}
              // formats={this.formats}
              readOnly={this.currentItem.get('lock')}
              value={this.currentItem.get('context')}
              // onKeyDown={this.handleKeyDown}
              onFocus={this.focusViewHandler}
              onChange={this.changeUpdateView}
            />
          </div>
          <button type="submit">Submit</button>
        </fieldset>
        </form>
      </section>
    );
  }
}

export default MemoView;
