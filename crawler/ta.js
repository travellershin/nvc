let parse_ta = {
    counter: 0,
    ta_url:[],

    init: function(txt, url){
        let titleIdx = txt.indexOf("<title>");
        let titleTxt = txt.slice(titleIdx, titleIdx+100);

        this.ta_url = url.split("Activities");
        this.ta_url[0] = this.ta_url[0]+'Activities-oa'

        let isDefined = false;

        for (var i = 0; i < cityName.length; i++) {
            if(titleTxt.includes(cityName[i])){
                city = cityCode[i];
                isDefined = true;

                this.surface(txt, 0);
            }
        }

        if(!isDefined){
            $(".site").html("인식할 수 없는 도시명입니다. 확인해주세요!")
        }
    },

    surface: function(text, idx){
        let that = this;

        let afterTxt = text.slice(text.indexOf('<div class="attraction_clarity_cell">'))
        let idxcutter = afterTxt.indexOf('<div class="listing_title ">')

        if(idxcutter>0){
            afterTxt = afterTxt.slice(afterTxt.indexOf('target="_blank">')+16)
            let nameEndIdx = afterTxt.indexOf('</a>')
            let name = afterTxt.slice(0,nameEndIdx).trim()

            let tag = afterTxt.slice(afterTxt.indexOf("p13n_reasoning_v2"))
            tag = tag.slice(0,tag.indexOf("</div>"));
            if(tag.indexOf("onclick")>0){
                tag = $(tag).text();

                let linkUrl = afterTxt.slice(afterTxt.indexOf('listing_commerce'));
                linkUrl = linkUrl.slice(linkUrl.indexOf('href="')+6);
                linkUrl = linkUrl.slice(0,linkUrl.indexOf('"'));
                linkUrl = 'https://www.tripadvisor.co.kr' + linkUrl;
                // TODO: co.kr이 아니라 현지 주소 반환해야 함

                let timeoutNo = Math.floor(Math.random() * 200) + 1;

                let tagArray = tag.split(",");
                for (var i = 0; i < tagArray.length; i++) {
                    tagArray[i] = tagArray[i].replace(/[\n\r]/g, '').trim()
                }
                this.spot(linkUrl, name, tagArray)

                this.counter++

                setTimeout(function () {
                    that.surface(afterTxt, idx)
                }, 500+timeoutNo);
            }else{
                console.log(idx)
                if(idx<5){
                    this.otherUrl(idx+1)
                }else{
                    $(".site").html("완료!!!")
                }
            }
        }else{
            console.log(idx)
            if(idx<5){
                this.otherUrl(idx+1)
            }else{
                $(".site").html("완료!!!")
            }
        }
    },

    otherUrl: function(idx){
        let that = this;
        let newUrl = this.ta_url[0]+(idx*30)+this.ta_url[1]
        console.log(newUrl)

        let request = new XMLHttpRequest();
        request.open("GET",newUrl,false);
        //url에 get 요청을 보낼 것이며, 비동기 방식으로 실행될것이다(3번째 파라미터 async : true)
        request.onreadystatechange = function(){
            if(request.readyState === 4 && request.status === 200){
                //제대로 통신 되었는지를 확인한다.
                let type = request.getResponseHeader("Content-Type");
                //잘 통신이 되었다면 받아온 데이터의 타입을 확인한다.
                   if (type.match(/^text/)){
                       let txt = (request.responseText);
                       //데이터 타입이 텍스트가 맞다면 받아온 데이터를 txt라는 변수에 넣는다.

                       that.surface(txt,idx)

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
    },

    spot: function(url, name, tagArray){

        let countNo = this.counter

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

                       let coorTxt = txt.slice(txt.indexOf('maps.google.com'));
                       coorTxt = coorTxt.slice(coorTxt.indexOf('center=')+7);
                       coorTxt = coorTxt.slice(0,coorTxt.indexOf('&'))
                       coor = coorTxt.split(",")

                       $(".site").html("처리중 - "+name)

                       firebase.database().ref("cities/"+city+"/spots/ta/"+countNo).set({
                           name:name,
                           tag:tagArray,
                           rank:countNo,
                           coor:{lat:coor[0]*1,lng:coor[1]*1},
                       })


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
    }
}
