$.response.contentType = "application/text";
$.response.headers.set('Content-Disposition', 'attachment; filename=data.json');
$.response.status = 200;
$.response.setBody(JSON.stringify(main()));


function main(){
    var query = "SELECT \"PHY_STORE_NO\",\"COUNTRY\",\"CA_FISCPER_Z4\",\"CA_FISCPER_Z5\",\"STORE_NAME\","
                + "SUM(\"AMOUNT\"),SUM(\"CM_COUNT\")"
                + "FROM \"_SYS_BIC\".\"development.DKHAITAN.UI5.google-map.model.view/CA_CUST_TRANS\""
                + "GROUP BY \"PHY_STORE_NO\",\"COUNTRY\",\"CA_FISCPER_Z4\",\"CA_FISCPER_Z5\",\"STORE_NAME\"";
    try {
        var data =[];
		var conn = $.db.getConnection();
		var pstmt = conn.prepareStatement(query);
		var rs = pstmt.executeQuery();
		while (rs.next()) {
		 var rec_line = {};
		 rec_line.PHY_STORE_NO = rs.getString(1);
		 rec_line.COUNTRY = rs.getString(2);
		 rec_line.CA_FISCPER_Z4 = rs.getString(3);
		 rec_line.CA_FISCPER_Z5 = rs.getString(4);
		 rec_line.STORE_NAME = rs.getString(5);
		 rec_line.AMOUNT=rs.getString(6);
		 rec_line.CM_COUNT=rs.getString(7);
		 data.push(rec_line);
		}
    }catch(e){}
    return data;
}