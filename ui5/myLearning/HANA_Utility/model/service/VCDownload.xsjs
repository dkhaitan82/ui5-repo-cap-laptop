$.response.status = 200;

function getCSVData(delim) {
	try {
		var query = "SELECT * FROM \"_SYS_BIC\".\"development.DKHAITAN.mail1.model/CA_DIM_VIRTUAL_COLUMNS\"";
		var conn = $.db.getConnection();
		var pstmt = conn.prepareStatement(query);
		var rs = pstmt.executeQuery();
		$.response.contentType = "application/text";
		$.response.headers.set('Content-Disposition', 'attachment; filename=vc.csv');
		$.response.headers.set('access-control-allow-origin', '*');
		var data = "Schema" + delim;
		data += "Table" + delim;
		data += "Column" + delim;
		data += "Data Type" + delim;
		data += "Length" + delim;
		data += "Scale" + delim;
		data += "Generated As" + delim;
		data += "Alter Statement" + delim + "\n";
		while (rs.next()) {
			data += rs.getNString(1) + delim;
			data += rs.getNString(2) + delim;
			data += rs.getNString(3) + delim;
			data += rs.getNString(4) + delim;
			data += rs.getNString(5) + delim;
			data += rs.getNString(6) + delim;
			data += rs.getNString(7) + delim;
			data += rs.getNString(8) + delim;
			data += "\n";
		}
		conn.close();
		$.response.setBody(data);
	} catch (e) {
		$.response.contentType = "application/json";
		$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
		$.response.setBody(JSON.stringify({
			Status: "Error",
			Message: e.message
		}));
		return;
	}
}
	function getExcelData() {
		try {
			var query = "SELECT * FROM \"_SYS_BIC\".\"development.DKHAITAN.mail1.model/CA_DIM_VIRTUAL_COLUMNS\"";
			var conn = $.db.getConnection();
			var pstmt = conn.prepareStatement(query);
			var rs = pstmt.executeQuery();
			$.response.contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
			$.response.headers.set('Content-Disposition', 'attachment; filename=vc.xml');
			$.response.headers.set('access-control-allow-origin', '*');
			var data = '<?xml version="1.0" encoding="UTF-8"?>';
			data += '<?mso-application progid="Excel.Sheet"?>';
			data +=
				'<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:html="http://www.w3.org/TR/REC-html40">';
			data += '<Styles><Style ss:Name="Normal" ss:ID="Default"><Alignment ss:Vertical="Bottom"/>';
			data +=
				'<Font ss:Color="#000000" ss:Size="11" x:Family="Swiss" ss:FontName="Calibri"/></Style><Style ss:ID="s62"><Alignment ss:Vertical="Bottom" ss:WrapText="1"/></Style></Styles>';
			data += '<Worksheet ss:Name="Virtual Columns">';
			data += '<Table ss:ExpandedColumnCount="8">';
			data += '<Column ss:Width="110.25" ss:AutoFitWidth="0"/>';
			data += '<Column ss:Width="249.75" ss:AutoFitWidth="0" ss:StyleID="s62" ss:Index="7"/>';
			data += '<Column ss:Width="336.75" ss:AutoFitWidth="0" ss:StyleID="s62"/>';
			data += "<Row>";
			data += '<Cell><Data ss:Type="String">' + "Schema" + '</Data></Cell>';
			data += '<Cell><Data ss:Type="String">' + "Table" + '</Data></Cell>';
			data += '<Cell><Data ss:Type="String">' + "Column" + '</Data></Cell>';
			data += '<Cell><Data ss:Type="String">' + "Data Type" + '</Data></Cell>';
			data += '<Cell><Data ss:Type="String">' + "Length" + '</Data></Cell>';
			data += '<Cell><Data ss:Type="String">' + "Scale" + '</Data></Cell>';
			data += '<Cell><Data ss:Type="String">' + "Generated As" + '</Data></Cell>';
			data += '<Cell><Data ss:Type="String">' + "Alter Statement" + '</Data></Cell>';
			data += "</Row>";
			while (rs.next()) {
				data += "<Row>";
				data += '<Cell><Data ss:Type="String">' + rs.getNString(1) + '</Data></Cell>';
				data += '<Cell><Data ss:Type="String">' + rs.getNString(2) + '</Data></Cell>';
				data += '<Cell><Data ss:Type="String">' + rs.getNString(3) + '</Data></Cell>';
				data += '<Cell><Data ss:Type="String">' + rs.getNString(4) + '</Data></Cell>';
				data += '<Cell><Data ss:Type="String">' + rs.getNString(5) + '</Data></Cell>';
				data += '<Cell><Data ss:Type="String">' + rs.getNString(6) + '</Data></Cell>';
				data += '<Cell><Data ss:Type="String">' + rs.getNString(7) + '</Data></Cell>';
				data += '<Cell><Data ss:Type="String">' + rs.getNString(8) + '</Data></Cell>';
				data += "</Row>";
			}
			data += "</Table></Worksheet></Workbook>";
			conn.close();
			$.response.setBody(data);
		} catch (e) {
			$.response.contentType = "application/json";
			$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
			$.response.setBody(JSON.stringify({
				Status: "Error",
				Message: e.message
			}));
			return;
		}
	}

	//Implementation of PUT call
	function fnHandlePut() {
		return {
			"myStatus": "success"
		};
	}

	try {
		switch ($.request.method) {
			//Handle your GET calls here
			case $.net.http.GET:
				if ($.request.parameters.get("format") == "XLS") {
					getExcelData();
				}
				if ($.request.parameters.get("format") == "CSV"){
				    var delim = $.request.parameters.get("sep");
				    if(delim!==undefined){
				       getCSVData(delim);
				    }
				}
				break;
				//Handle your PUT calls here
			case $.net.http.PUT:
				$.response.setBody(JSON.stringify(fnHandlePut()));
				break;
			default:
				break;
		}
	} catch (err) {
		$.response.setBody("Failed to execute action: " + err.toString());
	}
	