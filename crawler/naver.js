let cityTest = {
    las:["라스베가스", "라스베이거스"],
    nyc:["뉴욕"]
};

let dataObj = {

};

let parse_naver = {
    init: function(txt, url){
        let date = new Date().toISOString().slice(0,10); //YYYY-MM-DD
        let articleID = url.split("article/")[1].split("/cv")[0]; //네이버 게시물의 게시번호
        let cityCode = $("#cityCode option:selected").val(); //선택한 도시 코드
        let titleTxt = txt.slice(txt.indexOf('<h3 class="u_ni_title">'),txt.indexOf('<h3 class="u_ni_title">')+80); //네이버 게시물 제목 대충 파싱

        //해당 도시 관련 글이라면 들어가있을 키워드가 있는지 검사하는 부분
        let testArray = cityTest[cityCode];
        let passTest = false;
        for (let i = 0; i < testArray.length; i++) {
            let text = testArray[i]; 
            if(titleTxt.indexOf(text)>0){
                passTest = true;
            }
        }

        //통과되었다면 다음으로 진행

        if(passTest){
            let mainUrl = `https://blog.stat.naver.com/api/blog/article/cv?timeDimension=WEEK&startDate=${date}&contentId=${articleID}&exclude=articleInfo`;
            let that = this;
            firebase.database().ref(`stats/${cityCode}/blog/naver/${articleID}`).once("value", snap => {
                dataObj = snap.val();
                console.log(dataObj)
                that.getData(mainUrl, cityCode, articleID, date);
            });
        }else{
            alert("도시가 잘못 선택된 것 같습니다. 아니면 신동원에게 말씀해주세요");
        }
        
    },

    surface: function(text){
        let that = this;

        let spotUrlIdx = text.indexOf('?where=nexearch');

        let spotUrl = text.slice(spotUrlIdx)
        spotUrl = 'https://search.naver.com/search.naver'+ spotUrl.slice(0,spotUrl.indexOf('">'))
        spotUrl = spotUrl.replace(/&amp/g,'')
        spotUrl = spotUrl.replace(/;/g,'&')

        let rank = text.slice(text.indexOf('<span class="grade">')+20);
        rank = rank.slice(0,rank.indexOf("위"));

        if(spotUrlIdx > 0){
            let afterTxt = text.slice(text.indexOf('<div class="list_title">'))
            afterTxt = afterTxt.slice(afterTxt.indexOf('<strong>')+8)

            let nameEndIdx = afterTxt.indexOf('</strong>')
            let name = afterTxt.slice(0,nameEndIdx)

            let tag = afterTxt.slice(afterTxt.indexOf('cate">')+6);
            tag = tag.slice(0,tag.indexOf('</span>'))

            this.spot(spotUrl, name, tag, rank)

            setTimeout(function () {
                that.surface(afterTxt)
            }, 1000);
        }else{
            $(".site").html("처리 완료")
        }
    },

    getData: function(url, cityCode, articleID, date){

        let request = new XMLHttpRequest();
        request.open("GET",url,false);
        //url에 get 요청을 보낼 것이며, 비동기 방식으로 실행될것이다(3번째 파라미터 async : true)
        request.onreadystatechange = function(){
            if(request.readyState === 4 && request.status === 200){
                let returnData = JSON.parse(request.responseText);
                let data = returnData.result.statDataList[0].data.rows;

                $(".site").html("조회수 확인 완료");

                let totalNo = 0;

                for (let i = 0; i < data.cv.length; i++) {
                    let views = data.cv[i];
                    if(views>0){
                        let weekStart = data.date[i];
                        if(!dataObj){
                            dataObj = {};
                        }
                        if(dataObj === null){
                            dataObj = {};
                        }

                        if(!dataObj[weekStart]){
                            totalNo++;
                        }
                    }
                }
                searchWeek(0,totalNo, cityCode, articleID, date, data);
             }
         };
         request.send(null);
    }
};

function searchWeek(no, totalNo, cityCode, articleID, date, data){
    let weekStart = data.date[no];
    let views = data.cv[no];
    if(dataObj === null){
        dataObj = {};
    }

    dataObj[weekStart] = {views:views};

    no++;
    if(no<totalNo){
        searchWeek(no,totalNo, cityCode, articleID, date, data);
    }

    console.log(dataObj);
    
}
