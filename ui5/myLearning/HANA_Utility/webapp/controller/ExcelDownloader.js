sap.ui.define([], function () {
	"use strict";
	return {
	    // ============================================================
		// Main function                               
		// ============================================================
	    downloadExcel:function(oXLS){
	        var data = this._buildExcel(oXLS);
	        var a = window.document.createElement('a');
		    a.href = window.URL.createObjectURL(new Blob([data], {type: 'text/xml'}));
		    a.download = 'DATA.xls';
		    document.body.appendChild(a);
		    a.click();
		    document.body.removeChild(a);
	    },
	    // ============================================================
		// Busild the workbook                               
		// ============================================================
		_buildExcel: function (aXls) {
		    var data=this._getExcelWrokBookHeader();
		    var oThis = this;
            jQuery.each(aXls,function(index,obj){
                data+=oThis._getWorkSheetHeader(obj.sheetName);
                data+=oThis._getExcelTable(obj.columns,obj.data);
                data+=oThis._getWorkSheetFooter();
            });
            data+=this._getWorkBookFooter();
            return data;
		},
		// ============================================================
		// Build excel table                               
		// ============================================================
		_getExcelTable:function(aColumns,aData){
			var data = '<ss:Table>';
			for(var k=0;k<aColumns.length;k++){
			    data+='<ss:Column ss:Width="80"/>';
			}
			data+='<ss:Row>';
			for(var l=0;l<aColumns.length;l++){
			    data += '<ss:Cell><ss:Data ss:Type="String">' + aColumns[l] + '</ss:Data></ss:Cell>';
			}
			data += "</ss:Row>";
			jQuery.each(aData,function(index,oData){
			    data+='<ss:Row>';
			    for(var j=0;j<aColumns.length;j++){
			        data += '<ss:Cell><ss:Data ss:Type="String">' + oData[aColumns[j]] + '</ss:Data></ss:Cell>';
			    }
			    data += "</ss:Row>";
			});
			data += "</ss:Table>";
			return data;
		},
		// ============================================================
		// Insert header for worksheet                               
		// ============================================================
		_getWorkSheetHeader:function(sSheet){
		   return  '<ss:Worksheet ss:Name="'+sSheet+'">';
		},
		// ============================================================
		// Insert footer for worksheet                               
		// ============================================================
		_getWorkSheetFooter:function(){
		   return  "</ss:Worksheet>";
		},
		// ============================================================
		// Insert header for workbook                               
		// ============================================================
		_getExcelWrokBookHeader:function(){
		    var data = '<?xml version="1.0"?>';
			data += '<?mso-application progid="Excel.Sheet"?>';
			data +='<ss:Workbook xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">';
			return data;
		},
		// ============================================================
		// Insert footer for workbook                            
		// ============================================================
		_getWorkBookFooter:function(){
		   return  "</ss:Workbook>";
		}
	};
});