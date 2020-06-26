// body内すべてのScrollScaleを格納する配列
const SCROLLSCALELIST = [];
let ISSMARTPHONE = false;
isSmartPhone();

function isSmartPhone() {
    if (navigator.userAgent.match(/iPhone|Android.+Mobile/)) {
      ISSMARTPHONE = true;
    }
}


// デフォルトのオプション
const OPTIONS = {
    size : "middle",
    animation : true,
    opacity : 0.9,
}

// ScrollScaleについて全体的な処理を行うクラス
class ScrollScale {
    // コンストラクタメソッド
    // 引数はScrollScaleのDOM
    constructor(elementName, options) {                                                     // インスタンス化する要素のid名とoptionを取得
        SCROLLSCALELIST.push(this);                                                         // 自身をSCROLLSCALELISTに追加
        this.element = document.getElementById(`${elementName}`);                           // ScrollScaleのDOMを変数elementに格納
        this.options = JSON.parse(JSON.stringify(OPTIONS));                                 // オプションを読み込む(ディープコピー)
        if (options === undefined ? null : options!=null) {                                 // optionsがnullでなかったら
            this.check_options(options)                                                           // option変更点を確認し更新
        }
        // SSVideoのインスタンスを生成
        this.video = new SSVideo(this.element.getElementsByTagName("video")[0], this.options);
        // SSContantsのインスタンスを生成
        this.contants = new SSContants(this.element.getElementsByClassName("contants")[0], this.options); 
        this.status = false;                                                                // 現在の状態を表す値を定義(拡大していたらtrue、拡大していなければfalseを示す)
        this.changeStyle();                                                                 // optionsの値によってstyleを変える
        if (ISSMARTPHONE==true) {
            this.options["animation"] = false;
        }
    }

    changeStyle() {
        if (this.options["size"]!="middle") {
            if (this.options["size"]=="large") {
                this.element.style["padding-top"] = "0";
                this.element.style["padding-bottom"] = "0";
            } else if (this.options["size"]=="small") {
                this.element.style["padding-top"] = "20vh";
                this.element.style["padding-bottom"] = "20vh";
            }
        }
    }

    // videoを拡大し全画面に
    scale_size() {
        this.video.activate();      // videoにアクティブ操作
        this.contants.activate();   // contantsにアクティブ操作
        this.status = true;         // statusをtrueに
    }

    // videoを元の大きさに戻す
    return_size() {
        this.video.deactivate();                // videoにディアクティブ操作
        this.contants.deactivate();             // contantsにディアクティブ操作
        this.element.style["height"] = "auto";  // ScrollScaleのheightをautoに戻す
        this.status = false;                    // statusをfalseに
    }

    // 入力(現在の画面の高さ)によってvideoを拡大するかしないか判断する
    // 引数は画面のheightとwindow.pageYOffset
    scroll_event(windowHeight, pageYOffset) {
        const scalePosition = this.video.calculate_scale_position();        // 拡大位置の基準点を計算(画面中央)
        if (scalePosition <= windowHeight/2　&& this.status==false) {       // 現在の要素の位置が基準点よりも上で拡大していなかったら
            this.scale_size();                                                    // 要素を拡大
        } else if (scalePosition > windowHeight/2 && this.status==true) {   // 現在の要素の位置が基準点よりも下で拡大していたら
            if (ISSMARTPHONE==false) {
                this.return_size();                                                   // 要素を縮小
            }
        } else if (this.status==true) {                                     // 拡大していたら
            this.contants.visible_children(pageYOffset);                          // contantsについて表示処理を行う
        }
    }

    // option変更点をチェックする
    check_options(options) {
        const keys = Object.keys(options);                // optionに含まれるキーを取得
        for (let i=0; i<keys.length; i++) {               // キーの数だけ繰り返す
            const key = keys[i];                          // 一つのキーに対して
            this.options[`${key}`] = options[`${key}`];   // キーの値を更新
        }
    }

    // 画面がリサイズされたとき
    resize_event() {
        if (ISSMARTPHONE==false) {
            this.contants.calculat_size_resize();
        }
    }
}

// ScrollScale内のvideoについて処理を行うクラス
class SSVideo {
    // コンストラクタメソッド
    // 引数はvideoのDOM, option情報
    constructor(video, options) {
        this.element = video;  // videoのDOMを格納
        this.options = options;
        this.changeStyle();    // optionsの値によってスタイルを変更する
        // this.videoOverlay = new SSVideoOverlay(this.element);
    }

    changeStyle() {
        if (this.options["size"]!="middle") {
            if (this.options["size"]=="large") {
                this.element.style["width"] = "100%";
                this.element.style["height"] = "100vh";
            } else if (this.options["size"]=="small") {
                this.element.style["width"] = "60%";
                this.element.style["height"] = "60vh";
            }
        }
    }

    // アクティブ化処理
    activate() {
        this.element.classList.add("active");   // videoのclassをactiveに(position, z-index, opacityが変化)
        if (this.options["size"]!="middle") {
            if (this.options["size"]=="large") {
                this.element.style["top"] = "0";
            } else if (this.options["size"]=="small") {
                this.element.style["top"] = "20vh";
            }
        }        
        //this.element.style["opacity"] = `${this.options["opacity"]}`;                                     //videoにぼかしを掛けようとしたところ
        //this.videoOverlay.activate();                                                                     //videoにぼかしを掛けようとしたところ
        this.element.play();                    // videoを再生
        this.calculat_size();                   // videoのサイズを変更(全画面表示に)
    }

    // ディアクティブ化処理
    deactivate() {
        //this.videoOverlay.deactivate();                                                                   //videoにぼかしを掛けようとしたところ
        this.element.style["opacity"] = "1";
        this.element.style["transform"] ="scale(1, 1)";    // 画像を元の大きさに戻す
        this.element.classList.remove("active");           // videoからクラスactiveを削除
        this.element.pause();                              // videoを停止
    }

    // videoを拡大した際の縦と横の大きさを計算してcssに適用
    calculat_size() {
        const windowHeight = window.innerHeight;          // windowの高さ
        const videoHeight = this.element.clientHeight;    // videoの高さ
        const scaleHeight = windowHeight/videoHeight;     // 割合を計算
    
        const parent = this.element.parentNode;           // videoの親要素を取り出す
        const parentWidth = parent.clientWidth;           // 親の横幅を取得
        const videoWidth = this.element.clientWidth;      // videoの横幅を取得
        const scaleWidth = parentWidth/videoWidth;        // 割合を計算

        this.element.style["transform"] = `scale(${scaleWidth}, ${scaleHeight})`;  // 縦幅を画面の中央を中心に拡大
    }

    // 画面拡大位置の基準点を計算する関数
    calculate_scale_position() {
        return this.element.getBoundingClientRect().top + this.element.clientHeight/2;   // videoの中心点を計算
    }
}

// 指定されたvideo要素にoverlayをつけるクラス
// 現在参照なし
class SSVideoOverlay {
    constructor(wrapContant) {
        this.wrapContant = wrapContant;
        this.wrapContant.parentNode.insertAdjacentHTML("afterbegin", `<div class=\"overlay\" style=\"width: ${this.wrapContant.clientWidth}px; height: calc(${this.wrapContant.clientHeight} - 20vh);\"></div>`);
        this.element = this.wrapContant.parentNode.getElementsByClassName("overlay")[0];
    }

    activate() {
        this.element.style["left"] = `${this.wrapContant.getBoundingClientRect().left}px`;
        this.element.style["top"] = `${this.wrapContant.getBoundingClientRect().top}px`;
        this.element.classList.add("active");
    }

    deactivate() {
        this.element.classList.remove("active");
    }
}

// ScrollScale内のcontantsについて処理を行うクラス
class SSContants {
    // コンストラクタメソッド
    // 引数はcontantsのDOM, option情報
    constructor(contants, options) {
        this.element = contants;                                                // contantsのDOMを格納
        this.options = options;
        this.elementChildren = [];                                              // contants内の子要素を格納する配列
        for (let i=0; i<this.element.children.length; i++) {                    // 子要素の数繰り返す
            // SSContantのインスタンスを生成し配列に格納
            this.elementChildren.push(new SSContant(this.element.children[i], this.options));     
        } 
    }

    // アクティブ化処理
    activate() {
        this.element.classList.add("active");               // contantsにクラスactiveを追加
        for (let i=0; i<this.elementChildren.length; i++) { // 子要素の数繰り返す
            this.elementChildren[i].activate();             // 子要素をアクティブ化
        }
        this.calculat_size();                               // contantsのサイズを計算し親要素に適用(contantsがabsoluteになると親要素の高さが0になってしまうため)
    }

    // ディアクティブ化処理
    deactivate() {
        this.element.classList.remove("active");               // contantsからクラスactiveを削除
        for (let i=0; i<this.elementChildren.length; i++) {    // 子要素の数繰り返す
            this.elementChildren[i].deactivate();                   // 子要素をディアクティブ化
        }
    }

    // 子要素全てに対してvisible化するかのチェックを行う
    // 引数はwindow.pageYOffset
    visible_children(pageYOffset) {
        for (let i=0; i<this.elementChildren.length; i++) {
            this.elementChildren[i].position_check(pageYOffset);
        }
    }

    // contantsのheightを計算する：この処理は必ず子要素全てをアクティブ化してから行う(子要素の大きさを取得できないため)
    calculat_size() {
        const videoHeight = window.innerHeight;                       // videoのheight
        // elementのheightと、elementと画面の相対位置のheightを足す
        // これによって、拡大した画像がcontants分だけ画面上部に固定される
        const ContantsHeight = this.element.offsetHeight+this.element.getBoundingClientRect().top;
        const parent = this.element.parentNode;                       // 親要素を取り出す
        if (videoHeight > ContantsHeight) {                           // contantTextのheightがcontantVideoより小さかったら
            parent.style["height"] = `${window.innerHeight}px`;           // heightをvideoに合わせる
        } else {                                                      // それ以外
            parent.style["height"] = `${ContantsHeight}px`;               // heightをcontantsに合わせる
        }
    }

    calculat_size_resize() {
        const videoHeight = window.innerHeight;                       // videoのheight
        // elementのheightと、elementと画面の相対位置のheightを足す
        // これによって、拡大した画像がcontants分だけ画面上部に固定される
        const ContantsHeight = this.element.offsetHeight+window.innerHeight*0.5;
        const parent = this.element.parentNode;                       // 親要素を取り出す
        parent.style["height"] = `${ContantsHeight}px`;               // heightをcontantsに合わせる
    }
}

// ScrollScaleのContantsに含まれる要素についての処理を行う
class SSContant {
    // コンストラクタメソッド
    // 引数はcontantsの1つの子要素
    constructor(contant, options) {
        this.element = contant;   // contantsの子要素のDOMを格納
        this.options = options;   
        this.status = false;      // この要素が現在表示されているかどうかを表す値
    }

    // アクティブ化処理
    activate() {
        this.element.classList.add("active");                                   // この要素にactiveクラスを付与

        // 縦方向中心よせ処理
        const elementHeight = this.element.clientHeight;                        // この要素のheightを取得
        const windowHeight = window.innerHeight;                                // windowのheightを取得
        const paddingTop = (1-elementHeight/windowHeight)*100/2;                // この要素を中央に寄せるための上下のpaddingを計算
        this.element.style["padding-top"] = `${paddingTop}vh`;                  // 上方向paddingを適用
        this.element.style["padding-bottom"] = `${paddingTop}vh`;               // 下方向paddingを適用
        // ここまで

        const top = this.element.getBoundingClientRect().top+window.pageYOffset;// この要素のpaddingを含むページ全体での位置を計算
        this.visible_point = top+this.element.clientHeight/2;                   // この要素が現れるべき基準点を計算(要素中央が基準点)
    }

    // ディアクティブ化処理
    deactivate() {
        this.element.style["padding-top"] = "0vh";      // 適用した上方向paddingを0に
        this.element.style["padding-bottom"] = "0vh";   // 適用した下方向paddingを0に
        this.element.style["opacity"] = "0";
        this.element.classList.remove("active");        // この要素のactiveクラスを削除
        this.element.classList.remove("visible");
    }

    // pageYOffsetの値によってcontantのアニメーションを決定する
    position_check(pageYOffset) {
        const windowHeight = window.innerHeight;        // 要素のheightを取得
        if (this.options["animation"]==false){
            this.element.classList.add("visible")
            this.element.style["opacity"] = "1";
            return
        }
        // もしこの要素の基準点が画面上にあったら
        if (pageYOffset <= this.visible_point && this.visible_point <= pageYOffset+windowHeight) {
            if (this.status==true) {                    // 既に要素が表示されていたら
                // 要素の中心点が画面topからどれだけ離れているのかheightを計算
                const elementCenter = this.element.getBoundingClientRect().top+this.element.clientHeight/2;
                const slope = -1/(windowHeight/2)**2;   // 係数

                // (画面中央, 1)を頂点とする二次関数として滑らかに遷移するようにopacityを計算
                const opacity = slope*(elementCenter-windowHeight/2)**2+1;
                // 計算したopacityを適用
                this.element.style["opacity"] = `${opacity}`;
            } else {                                    // まだ表示されていなかったら
                this.element.classList.add("visible");      // 要素にvisibleクラスを追加
                this.status = true;                         // ステータスを表示済みに
            }
        } else {                                        // この要素の基準点が画面上になかったら
            this.element.classList.remove("visible");       // 要素からvisibleクラスを削除
            this.status = false;                            // ステータスを非表示に
        }
    }
}

// windowがスクロールされた場合に実行される
window.addEventListener("scroll", function(){
    const windowHeight = window.innerHeight;                         // 現在表示されている画面の高さを計算
    const pageYOffset = window.pageYOffset;                          // 画面上部までスクロールされたWebページのheightを取得
    for(i=0; i<SCROLLSCALELIST.length; i++) {                        // SCROLLSCALELISTの数だけ繰り返す
        SCROLLSCALELIST[i].scroll_event(windowHeight, pageYOffset);      // すべてのScrollScaleインスタンスに対してscroll_eventを実行
    }
});


// windowがリサイズされた場合に実行される
window.addEventListener("resize", function(){
    for(i=0; i<SCROLLSCALELIST.length; i++) {       // SCROLLSCALELISTの数だけ繰り返す
        SCROLLSCALELIST[i].resize_event();                 // すべてのScrollScaleインスタンスに対してscroll_eventを実行
    }
});