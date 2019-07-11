let taRank = 0;
let txt = "";
let url = ""



chrome.runtime.onMessage.addListener(function(request, sender) {
  if (request.action == "getSource") {
    txt = request.source;

    chrome.tabs.query({
        active:true,
        currentWindow:true
    },function(tabs){
        url = tabs[0].url;

        detectSite(url);
    });
  }
});

$(".start").click(function(){
    if($(".site").attr("id")==="unknown"){
        alert("통계 추출 대상이 아닙니다.");
    }else{

        switch ($(".site").attr("id")) {
            case "naver": parse_naver.init(txt, url);
                break;

            default: return false;

        }
    }
});

function onWindowLoad() {

    var config = {
        apiKey: "AIzaSyCGyYCer452y2cYtuW8kr8aPfeV5FZOmcI",
        authDomain: "intranet-tripbon.firebaseapp.com",
        databaseURL: "https://intranet-tripbon.firebaseio.com",
        projectId: "intranet-tripbon",
        storageBucket: "intranet-tripbon.appspot.com",
        messagingSenderId: "646042376400"
      };
    firebase.initializeApp(config);

    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
          console.log(user);
        firebase.database().ref().once("value", snap => {
            chrome.tabs.executeScript(null, {
              file: "getPagesSource.js"
            });
        });

      } else {
        // No user is signed in.
        firebase.auth().signInWithPopup(provider).then(function(result) {
            firebase.database().ref().once("value", snap => {
                chrome.tabs.executeScript(null, {
                  file: "getPagesSource.js"
                });
            });
        }).catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          // The email of the user's account used.
          var email = error.email;
          // The firebase.auth.AuthCredential type that was used.
          var credential = error.credential;
          // ...
          console.log(error.message);
        });
      }
    });


}

window.onload = onWindowLoad;


function detectSite(url){
    if(url.indexOf("blog.stat.naver.com")>-1){
        $(".site").html("네이버 블로그 통계 추출 준비.");
        $(".site").attr("id","naver");
    }else{
        $(".site").html("통계 추출 대상이 아닙니다.");
    }
}
