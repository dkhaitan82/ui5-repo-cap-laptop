sap.ui.define([
   "sap/ui/core/UIComponent",
   "sap/ui/model/json/JSONModel",
   "sap/ui/model/odata/v2/ODataModel",
   "sap/ui/model/resource/ResourceModel"
], function(UIComponent, JSONModel, ODataModel,ResourceModel) {
	"use strict";
	return UIComponent.extend("burberry.hana.util.Component", {
		metadata: {
			manifest: "json"
		},
		init: function() {
			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);
			var oData = {
				data: {
					current_action: "",
					job_field_active: true,
					step_field_active: true,
					email_field_active:true,
					job_dialog_validate:"OK",
					user_dialog_validate:"OK",
					job_value_state:"None",
					step_value_state:"None",
					subject_success_value_state:"None",
					subject_failure_value_state:"None",
					user_email_value_state:"None",
					user_name_value_state:"None",
					download_seperator:"|",
					download_filetype:"CSV",
					download_enable_seperator:true,
					vc_detail:{},
					job: {
						JOB_NAME: "",
						STEP_NAME: "",
						SUBJECT_SUCCESS: "",
						SUBJECT_FAILURE: "",
						BODY_NOTE_SUCCESS: "",
						BODY_NOTE_FAILURE: "",
						MAIL_INACTIVE: "",
						SUCCESS_ALERT: "",
						FAILURE_ALERT: "",
						user: {
							USER_EMAIL: "",
							USER_NAME: "",
							FAILURE_ALERT: "",
							SUCCESS_ALERT: ""
						}
					},
					test:{
					    item_path:"",
					    test_case_table_select_mode:"SingleSelectLeft",
					    total_success:"0",
					    call_area:"START",
					    tc_data_page_title:"",
					    tc_data:{},
					    tc_data_type:""
					}
				}
			};
			var oModel = new JSONModel(oData);
			this.setModel(oModel, "app");
			
			var i18nModel = new ResourceModel({
                bundleName : "burberry.hana.util.i18n.i18n"
            });
            this.setModel(i18nModel, "i18n");
            
            var resModel = new ResourceModel({
                bundleName : "burberry.hana.util.resource"
            });
            this.setModel(resModel, "res");
			
			this.getRouter().initialize();
		}

	});
});