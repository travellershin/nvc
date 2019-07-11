let parse_gg = {
    index: 0,
    init: function(txt, url){
        let cityNameTxt = txt.slice(txt.indexOf('placeholder="검색" value="')+24)
        cityNameTxt = cityNameTxt.slice(0,cityNameTxt.indexOf('"'))

        let isDefined = false;
        let textToParse = txt.slice(txt.indexOf('<ol'))

        for (var i = 0; i < cityName.length; i++) {
            if(cityNameTxt.includes(cityName[i])){
                city = cityCode[i];
                cityNameKo = cityName[i];
                isDefined = true;
                this.surface(txt);
            }
        }

        if(!isDefined){
            $(".site").html("인식할 수 없는 도시명입니다. 확인해주세요!")
        }
    },

    surface: function(text){
        console.log(text)
        let index = this.index;
        let that = this;

        let cutIdx = text.indexOf('<h2')

        if(cutIdx > 0){
            //이름이 있을 경우에 다음으로 진행한다 -> 이름이 없으면 관광지 리스트가 끝났다는 뜻

            let afterTxt = text.slice(cutIdx)
            //h2 이후부분에서 자른다. (명칭 앞부분)

            let name = afterTxt.slice(0, afterTxt.indexOf('</h2>')+5)
            //<h2>~~~</h2>부분이 잘리게 된다.
            name = $(name).text();
            //DOM 안의 txt만을 반환한다 -> 이름

            let testIdx = afterTxt.slice(4, afterTxt.indexOf('buUMge'));

            let tag = []

            if(testIdx.indexOf('<h2')<0){
                //중간에 h2가 끼어 있다는 것은 태그가 없어서 다음 관광지의 태그로 넘어갔다는 뜻인것이다.
                tagTxt = afterTxt.slice(afterTxt.indexOf('buUMge')+8)
                tagTxt = tagTxt.slice(0,tagTxt.indexOf('</p>'))

                tag = tagTxt.split(", ")
            }

            afterTxt = afterTxt.slice(5)
            //h2라는 부분을 잘라버린다.

            let namePara = name.replace(" ","+")
            let getUrl = 'https://www.google.co.kr/search?q='+cityNameKo+namePara
            this.spot(getUrl, name, tag, this.index)

            this.index++

            let rnd = Math.floor(Math.random() * 4000) + 1400;
            //1.4 ~ 4초 간격으로 검색한다.
            setTimeout(function () {
                that.surface(afterTxt)
            }, rnd);


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

                       let coorTxt = txt.slice(txt.indexOf('/maps/place/'));
                       coorTxt = coorTxt.slice(coorTxt.indexOf('@')+1)
                       coorTxt = coorTxt.slice(0,coorTxt.indexOf(',15z'))
                       let coor = coorTxt.split(",")

                       coor[0] = coor[0]*1
                       coor[1] = coor[1]*1


                       $(".site").html("처리중 - "+name)

                       console.log({
                           name:name,
                           tag:tag,
                           rank:rank,
                           coor:coor
                       })
                       if(coor.length === 2){
                           if(!isNaN(coor[0])&&!isNaN(coor[1])){
                               coor={lat:coor[0],lng:coor[1]}
                           }else{
                               coor={}
                           }

                       }else{
                           coor={}
                       }

                       firebase.database().ref("cities/"+city+"/spots/gg/"+rank).set({
                           name:name,
                           tag:tag,
                           rank:rank,
                           coor:coor
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
