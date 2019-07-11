var newYork = ["40.7028138,-74.012146",
"40.7036271,-74.0084338",
"40.7060183,-74.0113735",
"40.7057255,-74.0140557",
"40.7067503,-74.0164161",
"40.7091089,-74.0170813",
"40.7087998,-74.0145707",
"40.7045381,-74.0109015",
"40.7076937,-74.0128541",
"40.707401,-74.0095067",
"40.7047333,-74.0061378",
"40.7058719,-74.0043354",
"40.7087836,-74.0114164",
"40.7105565,-74.0157938",
"40.7101661,-74.0131116",
"40.713045,-74.0148067",
"40.7130613,-74.0117383",
"40.7111095,-74.0113306",
"40.7096619,-74.0098715",
"40.7086697,-74.0076828",
"40.7064901,-74.0068245",
"40.7052863,-74.0087986",
"40.7114023,-74.0094423",
"40.713354,-74.0092921",
"40.7108655,-74.0072966",
"40.7067178,-74.0094638",
"40.7074335,-74.0146995"]

var idx = 0;

//mygeodata.cloud

var parse_master = {

    init: function(){
        firebase.database().ref().once("value", snap => {
            var data = snap.val();
            if(data.masterTest){

                idx = data.masterTest*1;

                this.checkATM(idx)

            }else if(data.masterTest === 0){
                idx = data.masterTest*1;

                this.checkATM(idx)
            }
        })


    },


    checkATM: function(idx){
        var coorTxt = newYork[idx].split(",")
        let url = 'https://www.mastercard.us/locator/NearestLocationsService/?latitude='+coorTxt[0]+'&longitude='+coorTxt[1]+'&radius=5&distanceUnit=&locationType=atm&maxLocations=100'

        let that = this;

        let request = new XMLHttpRequest();
        request.open("GET",url,false);
        //url에 get 요청을 보낼 것이며, 비동기 방식으로 실행될것이다(3번째 파라미터 async : true)
        request.onreadystatechange = function(){
            if(request.readyState === 4 && request.status === 200){
                //제대로 통신 되었는지를 확인한다.
                       console.log(idx+' - text come')
                       let txt = (request.responseText);
                       //데이터 타입이 텍스트가 맞다면 받아온 데이터를 txt라는 변수에 넣는다.
                       toJSON(txt)

             }else{
                 console.log(request.status)
                 console.log('사이트 응답 지연중')
                 //비동기 방식의 특성상, 이 로그는 서버 응답이 아무리 빨라도 몇 차례 뜰 것이다.
             }
         };
         request.send(null)
    }
}

var nyc = {}

function toJSON(xml) {
    var locArray = xml.split('</location>');

    for (var i = 0; i < locArray.length - 1; i++) {

        var txt = locArray[i]

        var atm = {
            id:"",
            name:"",
            address:"",
            post:"",
            sponsor:"",
            coor:{
                lat:"",
                lng:""
            }
        }


        var cutter = '<attribute key="LOC_ID">'
        txt = txt.slice(txt.indexOf(cutter)+cutter.length)
        atm.id = txt.slice(0,txt.indexOf('</attribute>'));
        var id = atm.id;

        cutter = '<attribute key="LOC_NAM">'
        txt = txt.slice(txt.indexOf(cutter)+cutter.length)
        atm.name = txt.slice(0,txt.indexOf('</attribute>'));

        cutter = '<attribute key="POST_CD">'
        txt = txt.slice(txt.indexOf(cutter)+cutter.length)
        atm.post = txt.slice(0,txt.indexOf('</attribute>'));

        cutter = '<attribute key="SPNSR_NAM">'
        txt = txt.slice(txt.indexOf(cutter)+cutter.length)
        atm.sponsor = txt.slice(0,txt.indexOf('</attribute>'));

        cutter = '<attribute key="ADDR_LINE1">'
        txt = txt.slice(txt.indexOf(cutter)+cutter.length)
        atm.address = txt.slice(0,txt.indexOf('</attribute>'));

        cutter = '<point longitude="'
        txt = txt.slice(txt.indexOf(cutter)+cutter.length)
        atm.coor.lng = txt.slice(0,txt.indexOf('"'))*1;

        cutter = 'latitude="'
        txt = txt.slice(txt.indexOf(cutter)+cutter.length)
        atm.coor.lat = txt.slice(0,txt.indexOf('"'))*1;

        nyc[id] = atm;
    }



    firebase.database().ref('cities/nyc/local/atm_master').update(nyc).then(() => {


        firebase.database().ref('masterTest').set(idx).then(() => {
            console.log(idx +'/' + newYork.length + ' Write succeeded!');
            idx++;
            if(idx<newYork.length){
                $(".site").html(idx +'/' + newYork.length + " 개 처리중");
                parse_master.checkATM(idx);
            }else{
                 $(".site").html("처리완료")
            }

        });


      });;
};
