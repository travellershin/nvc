let parse_lp = {
    index: 0,

    init: function(txt, url){
        let isDefined = false;

        for (var i = 0; i < cityName_en.length; i++) {
            if(url.includes(cityName_en[i])){
                city = cityCode[i];
                isDefined = true;
                let textToParse = txt.slice(txt.indexOf("PageArticle-content"),txt.indexOf('<div class="Toast"'))

                this.surface(textToParse);
            }
        }

        if(!isDefined){
            $(".site").html("인식할 수 없는 도시명입니다. 확인해주세요!")
        }
    },

    surface: function(text){

        let that = this;

        let listIdx = text.indexOf('ListItem-content');

        if(listIdx>0){
            let afterTxt = text.slice(listIdx)

            let tag = afterTxt.slice(afterTxt.indexOf('<div'))
            tag = tag.slice(0,tag.indexOf('</div>'))
            tag = $(tag).text();
            tag = tag.replace('Top Choice ','');
            tag = tag.split('  in ')[0].trim()
            afterTxt = afterTxt.slice(afterTxt.indexOf('<a')+2);

            let spotUrl = afterTxt.slice(afterTxt.indexOf('href')+6)
            spotUrl = spotUrl.slice(0,spotUrl.indexOf('"'))
            spotUrl = 'https://www.lonelyplanet.com' + spotUrl;

            let name = afterTxt.slice(0,afterTxt.indexOf('</a>'))
            name = name.slice(name.indexOf('">')+2)

            this.spot(spotUrl, name, tag, this.index)

            this.index++

            setTimeout(function () {
                that.surface(afterTxt)
            }, 1000);
        }else{
            $(".site").html("처리 완료")
        }

    },

    spot: function(url, name, tag, rank){

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

                       let coorTxt = txt.slice(txt.indexOf('StaticMap-image'));
                       coorTxt = coorTxt.slice(coorTxt.indexOf('small.png(')+10)
                       coorTxt = coorTxt.slice(0,coorTxt.indexOf(')'))
                       let coor_rev = coorTxt.split(",")
                       let coor = [coor_rev[1],coor_rev[0]]


                       $(".site").html("처리중 - "+name)

                       firebase.database().ref("cities/"+city+"/spots/lp/"+rank).set({
                           name:name,
                           tag:[tag],
                           rank:rank,
                           coor:{lat:coor[0]*1,lng:coor[1]*1}
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
