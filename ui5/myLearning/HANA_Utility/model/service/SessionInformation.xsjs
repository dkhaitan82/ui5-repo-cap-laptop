$.response.contentType = "application/json";
$.response.status = 200;
$.response.setBody(JSON.stringify(main()));

function main(){
    var oData = {};
    oData.USER_NAME = $.session.getUsername();
    return oData;
}