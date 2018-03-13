$.response.contentType = "application/json";
$.response.status = 200;
$.response.setBody(JSON.stringify(main()));

function main() {
	var output = {};
	var busArea = $.request.parameters.get("area");
	var testCase = $.request.parameters.get("case");
	var cmd = $.request.parameters.get("cmd");
	//var testBody = {};
	//testBody.SQL = "SELECT CURRENT_DATE FROM DUMMY ORDER BY CURRENT_DATE";
	var reqBody = $.request.body.asString();
	var query = reqBody;
	var vDay = new Date().getDate() < 10 ? "0" + new Date().getDate().toString() : new Date().getDate().toString();
	var vMonth = (new Date().getMonth() + 1) < 10 ? "0" + (new Date().getMonth() + 1).toString() : (new Date().getMonth() + 1).toString(); //getMonth() is zero indexed
	var vYear = new Date().getFullYear().toString();
	var todayDate = vYear + "-" + vMonth + "-" + vDay;
	output.CMD = cmd;
	output.BUS_AREA = busArea;
	output.TEST_CASE = testCase;
	output.DATE = todayDate;
	output.RECORD_COUNT = 0;
	output.SQL = query;
	output.MESSAGE = "";
	output.COLUMNS = [];
	output.DATA = [];
	output.RUN_TIME = 0;
	output.RET_CODE = 0;
    var output_1 = checkParameters(output);
    if(output_1.RET_CODE !== 0){
        return output_1;
    }
    var output_2 = {};
    if(output_1.CMD==="CHECK"||output_1.CMD==="EXECUTE"){
        output_2= executeQuery(output_1);
        if(output_1.CMD==="CHECK"){
            return output_2;
        }else{
            logResults(output_2);
            return output_2;
        }
        
    }
}



function checkParameters(output) {
	if (output.CMD.indexOf("CHECK")==-1 && output.CMD.indexOf("EXECUTE")==-1){
		output.RET_CODE = 2;
		output.MESSAGE="Invalid Command";
		return output;
	}
	if ((output.SQL.toUpperCase().indexOf("SELECT") == -1) || (output.SQL.toUpperCase().indexOf("FROM") == -1)) {
		output.MESSAGE="Malrequest:Invalid SQL";
		output.RET_CODE = 2;
		return output;
	}
	if ((output.SQL.toUpperCase().indexOf(" INSERT ") !== -1) || (output.SQL.toUpperCase().indexOf("INSERT ") !== -1) ||
	    (output.SQL.toUpperCase().indexOf(" UPDATE ") !== -1) || (output.SQL.toUpperCase().indexOf("UPDATE ") !== -1) ||
	    (output.SQL.toUpperCase().indexOf(" CREATE ") !== -1) || (output.SQL.toUpperCase().indexOf("CREATE ") !== -1) ||
	    (output.SQL.toUpperCase().indexOf(" UPSERT ") !== -1) || (output.SQL.toUpperCase().indexOf("UPSERT ") !== -1) ||
	    (output.SQL.toUpperCase().indexOf(" DELETE ") !== -1) || (output.SQL.toUpperCase().indexOf("DELETE ") !== -1) ||
	    (output.SQL.toUpperCase().indexOf(" ALTER ") !== -1) || (output.SQL.toUpperCase().indexOf("ALTER ") !== -1) ||
	    (output.SQL.toUpperCase().indexOf(" DROP ") !== -1) || (output.SQL.toUpperCase().indexOf("DROP ") !== -1) ||
	    (output.SQL.toUpperCase().indexOf(" TRUNCATE ") !== -1) || (output.SQL.toUpperCase().indexOf("TRUNCATE ") !== -1) ||
	    (output.SQL.toUpperCase().indexOf(" RENAME ") !== -1) || (output.SQL.toUpperCase().indexOf("RENAME ") !== -1) ||
	    (output.SQL.toUpperCase().indexOf(" GRANT ") !== -1) || (output.SQL.toUpperCase().indexOf("GRANT ") !== -1) ||
	    (output.SQL.toUpperCase().indexOf(" REVOKE ") !== -1) || (output.SQL.toUpperCase().indexOf("REVOKE ") !== -1) ||
	    (output.SQL.toUpperCase().indexOf(" ROLLBACK ") !== -1) || (output.SQL.toUpperCase().indexOf("ROLLBACK ") !== -1) ||
	    (output.SQL.toUpperCase().indexOf(" SAVEPOINT ") !== -1) || (output.SQL.toUpperCase().indexOf("SAVEPOINT ") !== -1) ||
	    (output.SQL.toUpperCase().indexOf(" LOCK ") !== -1) || (output.SQL.toUpperCase().indexOf("LOCK ") !== -1) ||
	    (output.SQL.toUpperCase().indexOf(" MERGE ") !== -1) || (output.SQL.toUpperCase().indexOf("MERGE ") !== -1)
	    ) {
		output.MESSAGE="Malrequest:Invalid SQL(Only SELECT Statement Allowed)";
		output.RET_CODE = 2;
		return output;
	}
	/*if ((output.SQL.indexOf("ORDER") == -1)) {
		output.MESSAGE="Please provide ORDER BY in your SQL";
		output.RET_CODE = 2;
		return output;
	}*/
	/*if ((output.SQL.indexOf("*") !== -1)) {
		output.MESSAGE="* not allowed in your SQL";
		output.RET_CODE = 2;
		return output;
	}*/
	return output;
}


function executeQuery(output) {
	var conn = null;
	var pcall = null;
	var retCode = true;
	var startTime = new Date().getTime();
	var rec_line = {};
	output.RUN_ID = Math.random().toString(36).substring(2) + (new Date()).getTime().toString(36);
	try {
		var conn = $.db.getConnection();
		var pstmt = conn.prepareStatement(output.SQL);
		var rs = pstmt.executeQuery();
		var rsmd = rs.getMetaData();
		var colCount = rsmd.getColumnCount();
		for (var i = 1; i <= colCount; i++) {
			output.COLUMNS.push(rsmd.getColumnLabel(i));
		}
		while (rs.next()) {
			rec_line = {};
			for (var j = 1; j <= colCount; j++) {
				rec_line[rsmd.getColumnLabel(j)] = rs.getString(j);
			}
			output.DATA.push(rec_line);
		}
		output.RECORD_COUNT = output.DATA.length;
	} catch (e) {
		retCode = false;
		output.RET_CODE = 8;
		output.MESSAGE = e.message;
	} finally {
		if (conn != null) {
			conn.close();
		}
		if (retCode == true) {
			var runTime = Math.floor(((new Date().getTime() - startTime))/1000);
			var outputRunTime = Math.floor(new Date().getTime() - startTime);
			if(output.RECORD_COUNT > 500 || runTime > 50){
			    output.MESSAGE = "Long Running/Long Output Query";
			    output.RUN_TIME = outputRunTime;
			    output.RET_CODE = 8;
			    output.DATA=[];
			}else{
			    output.MESSAGE = "Success";
			    output.RUN_TIME = outputRunTime;
			    output.RET_CODE = 0;
			}
		}
		return output;
	}
}

function logResults(output){
    
}