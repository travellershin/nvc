//0. 쿼리를 날려 탭의 정보(url)을 가져온다.

function scrapeThePage() {
// Keep this function isolated - it can only call methods you set up in content scripts
var htmlCode = document.documentElement.outerHTML;
return htmlCode;
}
$(document).ready(function() {
    chrome.tabs.query({
        //chrome.tabs.query는 열려있는 탭들의 정보를 가져온다. manifest.json의 permissions에 tabs가 포함되어야 한다.
        active:true,
        currentWindow:true
        //위의 조건을 달면 현재 열려서 활성화된 탭에 대한 정보만 가져와 불필요한 메모리 낭비를 막는다
    },function(tabs){
        let url = tabs[0].url;
        //탭 정보는 tabs 배열에 담긴다. 조건상 array length는 1이다. tabs[0].url을 통해 탭의 url정보에 접근할 수 있다.

        getTextfromUrl(url);
        //url 서버에 접속해 text를 가져올 함수를 실행한다.
    })
});

//1. 가져온 url의 서버에 request를 날려 text를 가져온다.
function getTextfromUrl(url,callback){
    let request = new XMLHttpRequest();
    request.open("GET",url,false);
    //url에 get 요청을 보낼 것이며, 비동기 방식으로 실행될것이다(3번째 파라미터 async : true)
    request.onreadystatechange = function(){
        if(request.readyState === 4 && request.status === 200){
            //제대로 통신 되었는지를 확인한다.
            let type = request.getResponseHeader("Content-Type");
            //잘 통신이 되었다면 받아온 데이터의 타입을 확인한다.
               if (type.match(/^text/)){
                   let txt = (request.responseText);
                   //데이터 타입이 텍스트가 맞다면 받아온 데이터를 txt라는 변수에 넣는다.
                   console.log('응답이 제대로 도착했습니다')

                   if(url.indexOf("naver")>-1){
                       parseNaver(txt)
                   }else if(url.indexOf("tripadvisor")>-1){
                       parseTA(txt)
                   }
             }else{
                 console.log('응답이 텍스트가 아닌 형태로 왔습니다')
                 //데이터 타입이 텍스트가 아니라면 문제가 발생한 것이다.
             }
         }else{
             console.log('사이트 응답 지연중')
             //비동기 방식의 특성상, 이 로그는 서버 응답이 아무리 빨라도 몇 차례 뜰 것이다.
         }
     };
     request.send(null)
 };

function parseNaver(txt){

    let parse = function(text,eq){
        let nameIdx = text.indexOf('<div class="list_title"> <strong>')

        if(nameIdx > 0){
            let afterTxt = text.slice(nameIdx+33)

            let nameEndIdx = afterTxt.indexOf('</strong>')
            let name = afterTxt.slice(0,nameEndIdx)

            $(".yay").eq(eq).html(name)

            parse(afterTxt, eq+1)
        }
    }

    parse(txt,0);
}



function parseTA(txt){

    let parse = function(text,eq){
        let nameIdx = text.indexOf('<div class="attraction_clarity_cell">')

        let afterTxt = text.slice(nameIdx)
        afterTxt = afterTxt.slice(afterTxt.indexOf('<div class="listing_title ">'))
        let idxcutter = afterTxt.indexOf('target="_blank">')
        if(idxcutter>0){
            afterTxt = afterTxt.slice(idxcutter+16)
            let nameEndIdx = afterTxt.indexOf('</a>')
            let name = afterTxt.slice(0,nameEndIdx).trim()

            let tag = afterTxt.slice(afterTxt.indexOf("p13n_reasoning_v2"))
            tag = tag.slice(0,tag.indexOf("</div>"))
            tag = $(tag).text();

            $(".yay").eq(eq).html(name+" - "+tag)

            let tagArray = tag.split(",");
            for (var i = 0; i < tagArray.length; i++) {
                tagArray[i] = tagArray[i].replace(/[\n\r]/g, '').trim()
            }
            console.log(tagArray)

            parse(afterTxt, eq+1)
        }else{
            $(".yay").eq(eq+1).html("위의 "+eq+"개 관광지가 저장되었습니다")
        }
    }

    parse(txt,0);
}
