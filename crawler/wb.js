let parse_wb = {
    counter: 0,
    wb_url:"",

    init: function(txt, url){
        let titleTxt = txt.slice(txt.indexOf("<title>"), txt.indexOf("</title>"));
        let isDefined = false;

        for (var i = 0; i < cityName.length; i++) {
            if(titleTxt.includes(cityName[i])){
                city = cityCode[i];
                isDefined = true;

                this.wb_url = url

                let targetTxt = txt.slice(txt.indexOf("conts-box-list"),txt.indexOf('e//conts-box-list'))

                this.surface(targetTxt, 1);
            }
        }

        if(!isDefined){
            $(".site").html("인식할 수 없는 도시명입니다. 확인해주세요!")
        }
    },

    surface: function(text, idx){
        let that = this;

        let idxcutter = text.indexOf('<h4')

        if(idxcutter>0){
            let afterTxt = text.slice(idxcutter)

            let name = afterTxt.slice(0,afterTxt.indexOf('</h4>')+5);
            name = $(name).text()

            let linkUrl = afterTxt.slice(afterTxt.indexOf('ref="')+5);
            linkUrl = linkUrl.slice(0,linkUrl.indexOf('"'));

            linkUrl = 'https://www.wishbeen.co.kr' + linkUrl

            afterTxt = afterTxt.slice(afterTxt.indexOf('</h4>')+5)

            let description = afterTxt.slice(afterTxt.indexOf('<span'));
            description = description.slice(0, description.indexOf('</span>')+7)
            description = $(description).text();

            let tagTxt = afterTxt.slice(afterTxt.indexOf('"tag"'), afterTxt.indexOf('e//tag'))
            let tag = []

            let findTag = function(tagText){
                let tagIdx = tagText.indexOf('<a')

                if(tagIdx>0){
                    let tagItem = tagText.slice(tagIdx, tagText.indexOf('</a>')+4)
                    tag.push($(tagItem).text())

                    let afterTagTxt = tagText.slice(tagText.indexOf('</a>')+4);

                    findTag(afterTagTxt);
                }
            }
            findTag(tagTxt)

            console.log(linkUrl)
            this.spot(linkUrl, name, tag, description)

            this.counter++

            // setTimeout(function () {
            //     that.surface(afterTxt, idx)
            // }, 900);

        }else{
            if(idx<15){
                this.otherUrl(idx+1)
            }else{
                $(".site").html("완료!!!")
            }
        }
    },

    otherUrl: function(idx){
        let that = this;
        let newUrl = this.wb_url + '&viewPageNum=' + idx
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

    spot: function(url, name, tagArray, description){

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

                       let address = txt.slice(txt.indexOf('spot_base_info_panel'))
                       console.log(address)
                       address = address.slice(address.indexOf('<dt>주소'))
                       address = address.slice(address.indexOf('<dd>')+4,address.indexOf('</dd>'))

                       console.log(address)

                       $(".site").html("처리중 - "+name)

                       // firebase.database().ref(city+"/ta/"+countNo).set({
                       //     name:name,
                       //     tag:tagArray,
                       //     rank:countNo,
                       //     coor:{lat:coor[0]*1,lng:coor[1]*1},
                       // })

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
