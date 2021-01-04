window.addEventListener('load', function () {
    //判断是否是ie
    isIE();
    // 头部搜索栏下拉菜单
    headDraggeBinding();
    // 侧边栏下拉菜单，和侧边栏链接选中样式
    sideBarDraggeBinding();
    // tag选种样式
    tagBinding();
    //  view栏选中样式
    viewBinding();
    //  分页栏
    paging();
    // 返回顶部按钮
    totop();
}, false);

function isIE() {
    if (!!window.ActiveXObject || "ActiveXObject" in window) {
        window.location.replace("upgrade-browser.html");
    }
}
// 头部样式
// focus时展示下拉菜单
// blur时关闭下拉菜单
function headDraggeBinding() {
    var inputElement = document.getElementsByClassName("input")[0];
    var search = document.getElementsByClassName("item-right-search")[0];
    var searchContainer = document.getElementsByClassName("search-dragge-container")[0];
    var searchContent = document.getElementsByClassName("search-dragge-content")[0];
    var li = searchContent.querySelectorAll("li");
    var oldcontent = function () {
        let a = [];
        for (var i = 0; i < li.length; i++) {
            a[i] = li.item(i).innerHTML;
        }
        return a;
    }

    inputElement.addEventListener('focus', SearchDraggeDown, false);
    inputElement.addEventListener('blur', SearchDraggeDownClose, false);
    //自动补完搜索框-baidu的api
    inputElement.addEventListener('keyup', function (e) {
        let keywords = e.target.value;
        var URL = "http://suggestion.baidu.com/su?wd=" + keywords + "&cb=window.baidu.sug";
        autocomplete(URL);
    }, false);

    function SearchDraggeDown() {
        searchContainer.style.visibility = "visible";
        searchContainer.style.opacity = 1;
        search.className = "item-right-search-focus";
    }

    function SearchDraggeDownClose() {
        searchContainer.style.visibility = "hidden";
        searchContainer.style.opacity = 0;
        search.className = "item-right-search";
        if (searchContent.value == "") {
            for (var i = 0; i < oldcontent.length; i++) {
                li.item(i).innerHTML = oldcontent[i];
            }
        }

    }

    //没办法用ajax，得用jsonp（json with padding）解决跨域问题
    //jsonp 即利用HTML标签<script>中的url请求能够跨域这一特性，在js代码中拼接<script>标签来跨域
    //百度会返回一个callback方法window.baidu.sug()
    //返回的数据就包含在sug方法自带的参数中,这个参数是一个json对象

    //↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓这个json对象↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
    //{q:"关键字",p:false,s:["关键字","关键字有哪些","关键字c语言","关键字排序excel怎么设置",
    //"关键字是什么意思","关键字广告","关键字歌曲林俊杰","关键字排序","关键字优化","关键字序列"]}
    //  q：值等同于上文定义的搜索关键词keywords
    //  p：不知道，不重要
    //  s：我们需要的数据！！！！！可以看出是个字符串数组
    //在这里重写这一方法拿到json中的我们需要的数据


    function autocomplete(URL) {
        var script = document.createElement("script");
        var suggest = [];

        script.src = URL;
        document.getElementsByTagName("body")[0].appendChild(script);
        window.baidu = {
            sug: function (json) {
                suggest = json.s;
                changetext(suggest);
            }
        };

        function changetext(suggest) {
            if (suggest) {
                console.log(li);
                console.log(suggest);
                for (var i = 0; i < li.length; i++) {
                    if (suggest[i]) {
                        li.item(i).innerHTML = suggest[i];
                    } else {
                        li.item(i).remove();
                    }
                }
            }
            if (li.length == 0) {
                document.getElementsByClassName("search-dragge-title")[0].remove();
            }
        }
    }
}

// 侧边栏样式绑定
// 给侧边栏绑定事件监听器
// 当下拉菜单关闭时，点击事件将其打开，当下拉菜单打开时，点击事件将其关闭
function sideBarDraggeBinding() {
    //下拉菜单元素的前一个兄弟元素的集合
    var sideBarItems = document.getElementsByClassName("sidebar-navigator-collapse");
    //链接组class名
    var group = ["linkGroup-1", "linkGroup-2", "linkGroup-3", "linkGroup-4", "linkGroup-5"];

    group.forEach(item => {
        let thisGroup = document.getElementsByClassName(item);

        for (let i = 0; i < thisGroup.length; i++) {
            let thisLink = thisGroup.item(i);

            thisLink.addEventListener('click', function () {
                let oldName = this.className;
                let changedName = oldName;
                //清除所有“link-selected”class
                clearName();
                changedName += " link-selected";
                // console.log(thisLink+"的classname改为了" + changedName);
                this.className = changedName;
            }, false);
        }
    })

    function clearName() {
        group.forEach(item => {
            let thisGroup = document.getElementsByClassName(item);
            for (let i = 0; i < thisGroup.length; i++) {
                let thisLink = thisGroup.item(i);
                let thisClass = thisLink.className;
                // console.log("class为"+thisClass);
                let changedClass = thisClass.replace("link-selected", "");
                thisLink.className = changedClass;
                // console.log("清除所有selected class后，class改变为" + changedClass)
            }
        })
    }

    for (var i = 0; i < 4; i++) {
        var thisSideBarItem = sideBarItems.item(i);
        thisSideBarItem.addEventListener('click', function () {
            var links = this.nextElementSibling;
            if (links.style.display == "none" || links.style.display == "") {
                this.className = "sidebar-navigator-collapse-down sidebar-link";
                links.style.display = "block";
            } else {
                this.className = "sidebar-navigator-collapse sidebar-link";
                links.style.display = "none";
            }
        }, false);
    }
}

// tag栏样式绑定
//当点击tag时，tag背景颜色改变，同一组tag只能有一个被选中
function tagBinding() {
    var tagsCollection = document.getElementsByClassName("tags");
    var more = document.getElementById("more");
    var flextags = document.getElementsByClassName("recommend-container").item(0);
    //拿到class属性值为tags的元素的集合
    if (tagsCollection) {
        for (var i = 0; i < tagsCollection.length; i++) {
            var tags = tagsCollection.item(i).children;
            for (var j = 0; j < tags.length; j++) {
                // 对每个tags元素，取其后代元素的集合
                // 分别处理tags集合中的每个后代
                var tag = tags.item(j);
                // 给tags元素的每个后代(tag)绑定监听器
                tag.addEventListener('click', tagChange, false);
            }
        }
    }

    function tagChange() {
        // --先把这个tags集合里面的tag全部修改为未选中状态
        // 把当前tags集合内的tag元素的class属性值全部修改成“tag”
        var thisTags = this.parentNode.children;
        for (var i = 0; i < thisTags.length; i++) {
            var classBack = "tag";
            thisTags.item(i).className = classBack;
        }
        // --再把触发监听器的元素修改为选中状态
        // 把当前触发监听器的元素的class属性值修改为"tag tag-selected"
        this.className = "tag tag-selected";

        // ------------------------------------------------------------------
        // -------------在这里加入更多通过tag对主页面元素的操作-----------------
        // ------------------------------------------------------------------
    }
    // 给recommend栏tag元素绑定监听器

    if (more) {
        more.addEventListener('click', function () {
            if (flextags.className == "recommend-container-collapse") {
                flextags.className = "recommend-container";
            } else {
                flextags.className = "recommend-container-collapse";
            }
        })
    }
}


// view栏样式绑定
function viewBinding() {
    // 获取view栏左边和右边的元素组
    var viewLeft = document.getElementsByClassName("main-options-view-left-item");
    var viewRight = document.getElementsByClassName("main-options-view-Right-item");
    // 给view栏左边的每个元素绑定监听器
    if (viewLeft) {
        for (var i = 0; i < viewLeft.length; i++) {
            viewLeft.item(i).addEventListener('click', viewChange, false);
        }
    }
    // 监听器-左
    function viewChange() {
        for (var i = 0; i < viewLeft.length; i++) {
            // 获取view栏左边的每个元素分别用view代指
            var view = viewLeft.item(i);
            // 定义修改后的class属性值
            var classBack = "main-options-view-left-item";
            // 将每个view左边栏元素的class属性值修改为未选中状态
            view.className = classBack;
            // 再将触发这个监听器的view栏左边元素的class属性值修改为选中状态
            this.className = "main-options-view-left-item view-lfet-selected";
        }
    }
    //给view栏右边的每个元素绑定事件监听器
    for (var i = 0; i < viewRight.length; i++) {
        viewRight.item(i).addEventListener('click', function () {

        }, false);
    }
}

//paging分页按钮
// 按钮分为三个部分，左边的上页按钮，中间的一组换页按钮，右边的下页按钮
// 实现：
//     页面加载后，检查当前页面是否为上页/下页，是则改变上下页按钮样式
//     点击上下页按钮，当前页面改为上页/下页，中间按钮组改变
//     点击中间按钮组的非本页按钮，当前页变为点击页
function paging() {
    //当前页数
    var thispage = 1;
    //全部页数
    var total = 20;

    var pagePre = document.getElementsByClassName("page-previus").item(0);
    var pageNex = document.getElementsByClassName("page-next").item(0);
    var pageGroup = document.getElementById("pageGroup");
    var totalpage = document.getElementsByClassName("page-total").item(0);

    check();
    //检查是否是第一页或最后一页
    function check() {
        totalpage.innerHTML = total;
        pagePre.className = "page-previus";
        pageNex.className = "page-next";
        if (thispage == 1) {
            pagePre.className = "page-previus disabled";
        } else if (thispage == total) {
            pageNex.className = "page-next disabled";
        }
        changepage();
    }
    //绑定事件处理程序
    pagePre.addEventListener('click', function () {
        thispage -= 1;
        changepage();
        check();
    }, false);
    pageNex.addEventListener('click', function () {
        thispage += 1;
        changepage();
        check();
    }, false);
    for (var i = 0; i < pageGroup.children.length; i++) {
        pageGroup.children.item(i).addEventListener('click', function (e) {
            let newpage = e.target.innerHTML;
            thispage = newpage - 1;
            thispage += 1;
            changepage();
            check();
        })
    }


    function changepage(page) {
        writeNumber();
        cleanatyle();
        //页码在开始4页，显示1,2,3,4,5,6,7
        if (thispage <= 4) {
            //页码小于3但是大于0
            if (thispage > 0) {
                pageGroup.children.item(thispage - 1).className = "page-option page-now";
            } else {
                //页码小于0
                thispage = 1;
                writeNumber();
                cleanatyle();
                pageGroup.children.item(0).className = "page-option page-now";
            }
            //页码在最后四页
        } else if (thispage >= total - 3) {
            //页码超出范围
            if (thispage > total) {
                thispage = total;
                writeNumber();
                cleanatyle();
                pageGroup.children.item(6).className = "page-option page-now";
                //页码未超出范围
            } else {
                pageGroup.children.item(6 - (total - thispage)).className = "page-option page-now";
            }
            //页码在中间，大于3小于最大减3
        } else if (thispage > 3 && thispage < total - 3) {
            pageGroup.children.item(3).className = "page-option page-now";
        }

        function cleanatyle() {
            for (var i = 0; i < pageGroup.children.length; i++) {
                pageGroup.children.item(i).className = "page-option";
            }

        }

        function writeNumber() {
            //页码在4到倒数第四之间，高亮页码在中间
            if (thispage >= 4 && thispage <= total - 4) {
                for (var i = 0; i < 7; i++) {
                    let page = thispage;
                    pageGroup.children.item(i).innerHTML = page - 3 + i;
                }
                //页码小于4，显示正数7个页码：1,2,3,4,5,6,7,
            } else if (thispage <= 3) {
                for (var i = 0; i < 7; i++) {
                    pageGroup.children.item(i).innerHTML = i + 1;
                }
                //页码大于倒数第四，显示倒数7个页码
            } else if (thispage > total - 4) {
                for (var i = 0; i < 7; i++) {
                    pageGroup.children.item(i).innerHTML = total - 6 + i;
                }
            }
        }
    }
}


//返回顶部按钮
function totop() {
    var button = document.getElementById("totop");

    document.addEventListener('scroll', function () {
        console.log(document.documentElement.scrollTop);
        if (document.documentElement.scrollTop > 200) {
            button.style.display = "block";
        }
        if (document.documentElement.scrollTop < 200) {
            button.style.display = "none";
        }
    })
    button.addEventListener('click', function () {
        window.scroll({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
    })
}