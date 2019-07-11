let parse_hw = {
    init: function(txt, url){
        let decodedUrl = decodeURI(url)
        //검색어 쿼리를 알아내기 위해 url을 디코드한다.

        let textToParse = txt.slice(txt.indexOf("fabResultsContainer"),txt.indexOf("mapcontainer"))

        this.dormRoom(textToParse);

    },

    dormArray: [],
    privateArray: [],

    dormRoom: function(text){
        let that = this;

        let priceIdx = text.indexOf('class="dormroom');


        if(priceIdx > 0){
            let afterTxt = text.slice(priceIdx);
            afterTxt = afterTxt.slice(afterTxt.indexOf('>')+1)

            let price = afterTxt.slice(0,afterTxt.indexOf('</a>'))
            price = price.trim()
            price = price.slice(3)*1

            that.dormArray.push(price)
            that.dormRoom(afterTxt)

        }else{
            let sum = 0;
            for (var i = 0; i < that.dormArray.length; i++) {
                sum += that.dormArray[i]
            }
            let average = Math.round(sum/that.dormArray.length,1)
            $(".site").html("현재 도시의 호스텔 평균 가격은 "+average+" 입니다")
        }
    }
}
