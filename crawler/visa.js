let parse_visa = {
    index: 0,

    hotels:{},

    array:[],

    init: function(){
        firebase.database().ref("cities/nyc/hotels").once("value", snap => {
            this.hotels = snap.val();
            this.array = Object.keys(this.hotels);

            this.checkATM(0);
        })
    },



    makeUrl: function(idx){
        let txt = '{"wsRequestHeaderV2":{"applicationId":"VATMLOC","requestMessageId":"test12345678","userId":"CDISIUserID","userBid":"10000108","correlationId":"909420141104053819418"},'
        txt+='"requestData":{"culture":"en-US","distance":null,"distanceUnit":"mi","metaDataOptions":0,"location":{"address":null,"placeName":"","geocodes":{"latitude":"'
        txt+=this.hotels[this.array[idx]].coor.lat + '","longitude":"' + this.hotels[this.array[idx]].coor.lng;
        txt+='"}},"options":{"sort":{"primary":"distance","direction":"asc"},"range":{"start":0,"count":';
        txt+=30;
        txt+='},"operationName":"and","useFirstAmbiguous":true}}}'

        return encodeURI(txt)
    },

    checkATM: function(idx){
        let url = 'https://www.visa.com/atmlocator_services/rest/findNearByATMs?callback=jQuery1124018670284300449302_1530957634024&request='
        url += this.makeUrl(idx) + '%26_%3D1530957634028';

        console.log(url)
        let that = this;

        let request = new XMLHttpRequest();
        request.open("GET",url,false);
        //url에 get 요청을 보낼 것이며, 비동기 방식으로 실행될것이다(3번째 파라미터 async : true)
        request.onreadystatechange = function(){
            if(request.readyState === 4 && request.status === 200){
                //제대로 통신 되었는지를 확인한다.

                       let txt = (request.responseText);
                       //데이터 타입이 텍스트가 맞다면 받아온 데이터를 txt라는 변수에 넣는다.

                       txt = txt.split('jQuery1124018670284300449302_1530957634024(')[1];
                       txt = txt.slice(0,-1);

                       let data = JSON.parse(txt);
                       let setData = data.responseData[0].foundATMLocations;

                       if(!that.hotels[that.array[idx]].local){
                           if(data.responseData){
                                firebase.database().ref("cities/nyc/hotels/"+that.array[idx]+"/local/atm").set(setData)
                           }
                       }else{
                           if(!that.hotels[that.array[idx]].local.atm){
                               if(data.responseData){
                                    firebase.database().ref("cities/nyc/hotels/"+that.array[idx]+"/local/atm").set(setData)
                               }
                           }
                       }





             }else{
                 console.log(request.status)
                 console.log('사이트 응답 지연중');
                 //비동기 방식의 특성상, 이 로그는 서버 응답이 아무리 빨라도 몇 차례 뜰 것이다.
             }
         };
         request.send(null)

         idx++;

         setTimeout(function () {
             if(idx<that.array.length){
                 that.checkATM(idx);
                 $(".site").html("호텔번호 - "+that.array[idx] + " 처리중");
             }
         }, 1000);


    }
};