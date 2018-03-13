sap.ui.define([
   "sap/ui/core/mvc/Controller",
   "sap/m/MessageToast",
   "sap/ui/model/json/JSONModel",
   "sap/ui/model/odata/v2/ODataModel",
   "sap/m/MessageBox",
   "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/routing/History"
], function(Controller, MessageToast, JSONModel, ODataModel, MessageBox, Filter, FilterOperator,History) {
	"use strict";
	return Controller.extend("burberry.hana.util.controller.Jobs", {
	    // ============================================================
		// Initialize
		// ============================================================
		onInit: function() {
			var sOrigin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : "");
			var sURL = sOrigin + this._getResData("odata.jobs");
			var jobModel = new ODataModel(sURL);
			this.getView().setModel(jobModel, "jobs");
			this.getView().byId("jobTable").bindRows({
				path: "jobs>/Jobs",
				parameters: {
					expand: "toUsers"
				}
			});
		},
		// ============================================================
		// Get resource URLs
		// ============================================================
		_getResData:function(sProp){
		    var oBundle = this.getOwnerComponent().getModel("res").getResourceBundle();
		    return oBundle.getText(sProp);
		},
		// ============================================================
		// Table item selection event
		// ============================================================
		onItemSelected: function(oEvent) {
			var selIndex = this.getView().byId("jobTable").getSelectedIndex();
			var oModel = this.getView().getModel("jobs");
			if (selIndex >= 0) {
				var oContext = this.getView().byId("jobTable").getContextByIndex(selIndex);
				var oPath = oContext.getPath();
				this.getView().byId("userTable").bindRows({
					path: "jobs>" + oPath + "/toUsers"
				});
				this.getOwnerComponent().getModel("app").setProperty("/data/job/JOB_NAME", oModel.getProperty(oContext + "/JOB_NAME"));
				this.getOwnerComponent().getModel("app").setProperty("/data/job/STEP_NAME", oModel.getProperty(oContext + "/STEP_NAME"));
				this.getOwnerComponent().getModel("app").setProperty("/data/job/SUBJECT_SUCCESS", oModel.getProperty(oContext + "/SUBJECT_SUCCESS"));
				this.getOwnerComponent().getModel("app").setProperty("/data/job/SUBJECT_FAILURE", oModel.getProperty(oContext + "/SUBJECT_FAILURE"));
				this.getOwnerComponent().getModel("app").setProperty("/data/job/BODY_NOTE_SUCCESS", oModel.getProperty(oContext +
					"/BODY_NOTE_SUCCESS"));
				this.getOwnerComponent().getModel("app").setProperty("/data/job/BODY_NOTE_FAILURE", oModel.getProperty(oContext +
					"/BODY_NOTE_FAILURE"));
				this.getOwnerComponent().getModel("app").setProperty("/data/job/MAIL_INACTIVE", oModel.getProperty(oContext + "/MAIL_INACTIVE"));
				this.getOwnerComponent().getModel("app").setProperty("/data/job/SUCCESS_ALERT", oModel.getProperty(oContext + "/SUCCESS_ALERT"));
				this.getOwnerComponent().getModel("app").setProperty("/data/job/FAILURE_ALERT", oModel.getProperty(oContext + "/FAILURE_ALERT"));
			}
		},
		// ============================================================
		// Not used anymore
		// ============================================================
		onShowAllUsers: function(oEvent) {
			this.getView().byId("userTable").bindRows({
				path: "jobs>/Users"
			});
		},
		onDeleteJob: function(oEvent) {
			var selIndex = this.getView().byId("jobTable").getSelectedIndex();
			var oModel = this.getView().getModel("jobs");
			if (selIndex >= 0) {
				var oContext = this.getView().byId("jobTable").getContextByIndex(selIndex);
				MessageBox.show(
					"Are you sure to delete the Job from Configuration table?", {
						icon: sap.m.MessageBox.Icon.INFORMATION,
						title: "Confirm",
						actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
						onClose: function(oAction) {
							if (oAction == "YES") {
								oModel.remove(oContext.getPath(), {
									success: function(p) {
										MessageToast.show("Job Deleted Successfully");
									},
									error: function(p) {
										MessageToast.show("Cannot Delete the Job entry");
									}
								});
								oModel.refresh(true);
							}
						}
					}
				);
			} else {
				MessageToast.show("Please select Job row first");
			}
		},
		// ============================================================
		// New Job Alert
		// ============================================================
		onNewJob: function(oEvent) {
			var appModel = this.getOwnerComponent().getModel("app");
			appModel.setProperty("/data/current_action", "NEW_JOB");
			appModel.setProperty("/data/job_dialog_validate", "OK");
			appModel.setProperty("/data/job/JOB_NAME", "");
			appModel.setProperty("/data/job/STEP_NAME", "");
			appModel.setProperty("/data/job/SUBJECT_SUCCESS", "");
			appModel.setProperty("/data/job/SUBJECT_FAILURE", "");
			appModel.setProperty("/data/job/BODY_NOTE_SUCCESS", "");
			appModel.setProperty("/data/job/BODY_NOTE_FAILURE", "");
			appModel.setProperty("/data/job/MAIL_INACTIVE", "");
			appModel.setProperty("/data/job/SUCCESS_ALERT", "");
			appModel.setProperty("/data/job/FAILURE_ALERT", "");
			appModel.setProperty("/data/job_field_active", true);
			appModel.setProperty("/data/step_field_active", true);

			var oView = this.getView();
			var oDialog = oView.byId("jobDialog");
			// create dialog lazily
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "burberry.hana.util.view.JobDialog", this);
				oView.addDependent(oDialog);
			}
			oDialog.open();
		},
		// ============================================================
		// Edit Job Alert configuration
		// ============================================================
		onEditJob: function() {
			var appModel = this.getOwnerComponent().getModel("app");
			appModel.setProperty("/data/current_action", "EDIT_JOB");
			appModel.setProperty("/data/job_dialog_validate", "OK");
			appModel.setProperty("/data/job_field_active", false);
			appModel.setProperty("/data/step_field_active", false);
			var oView = this.getView();
			var oDialog = oView.byId("jobDialog");
			var selIndex = this.getView().byId("jobTable").getSelectedIndex();
			var oModel = this.getView().getModel("jobs");
			if (selIndex >= 0) {

				var oContext = this.getView().byId("jobTable").getContextByIndex(selIndex);
				/*var oPath = oContext.getPath();
				this.getView().bindElement({
					path: oPath,
					model: "jobs"
				});*/
				appModel.setProperty("/data/job/JOB_NAME", oModel.getProperty(oContext + "/JOB_NAME"));
				appModel.setProperty("/data/job/STEP_NAME", oModel.getProperty(oContext + "/STEP_NAME"));
				appModel.setProperty("/data/job/SUBJECT_SUCCESS", oModel.getProperty(oContext + "/SUBJECT_SUCCESS"));
				appModel.setProperty("/data/job/SUBJECT_FAILURE", oModel.getProperty(oContext + "/SUBJECT_FAILURE"));
				appModel.setProperty("/data/job/BODY_NOTE_SUCCESS", oModel.getProperty(oContext + "/BODY_NOTE_SUCCESS"));
				appModel.setProperty("/data/job/BODY_NOTE_FAILURE", oModel.getProperty(oContext + "/BODY_NOTE_FAILURE"));
				appModel.setProperty("/data/job/MAIL_INACTIVE", oModel.getProperty(oContext + "/MAIL_INACTIVE"));
				appModel.setProperty("/data/job/SUCCESS_ALERT", oModel.getProperty(oContext + "/SUCCESS_ALERT"));
				appModel.setProperty("/data/job/FAILURE_ALERT", oModel.getProperty(oContext + "/FAILURE_ALERT"));

				if (!oDialog) {
					// create dialog via fragment factory
					oDialog = sap.ui.xmlfragment(oView.getId(), "burberry.hana.util.view.JobDialog", this);
					oView.addDependent(oDialog);
				}
				oDialog.open();
			} else {
				MessageToast.show("Please select Job row first");
			}

		},
		// ============================================================
		// Close event for dialog
		// ============================================================
		onJobCancelDialog: function(oEvent) {
			this.getView().byId("jobDialog").close();
			this.resetJobValueState();
		},
		// ============================================================
		// Submit the entry in dialog
		// ============================================================
		onJobSubmitDialog: function(oEvent) {
			var oModel = this.getView().getModel("jobs");
			var newEntry = {};
			var appModel = this.getOwnerComponent().getModel("app");
			appModel.getProperty("/data/current_action");
			newEntry.JOB_NAME = appModel.getProperty("/data/job/JOB_NAME");
			newEntry.STEP_NAME = appModel.getProperty("/data/job/STEP_NAME");
			newEntry.SUBJECT_SUCCESS = appModel.getProperty("/data/job/SUBJECT_SUCCESS");
			newEntry.SUBJECT_FAILURE = appModel.getProperty("/data/job/SUBJECT_FAILURE");
			newEntry.BODY_NOTE_SUCCESS = appModel.getProperty("/data/job/BODY_NOTE_SUCCESS");
			newEntry.BODY_NOTE_FAILURE = appModel.getProperty("/data/job/BODY_NOTE_FAILURE");
			newEntry.MAIL_INACTIVE = appModel.getProperty("/data/job/MAIL_INACTIVE");
			newEntry.SUCCESS_ALERT = appModel.getProperty("/data/job/SUCCESS_ALERT");
			newEntry.FAILURE_ALERT = appModel.getProperty("/data/job/FAILURE_ALERT");
			this.validateJobDialog();
			if (appModel.getProperty("/data/current_action") == "NEW_JOB" && appModel.getProperty("/data/job_dialog_validate") == "OK") {
				oModel.create("/Jobs", newEntry, {
					success: function() {
						MessageToast.show("Job Entry created successfully");
					},
					error: function(err) {
						MessageBox.show("Error while creating Job Entry\nMake sure unique constraint is maintained", {
							title: "Error",
							onClose: null,
							icon: sap.m.MessageBox.Icon.ERROR,
							styleClass: "",
							initialFocus: null,
							textDirection: sap.ui.core.TextDirection.Inherit // default
						});
					}
				});
				oModel.refresh(true);
			}
			if (appModel.getProperty("/data/current_action") == "EDIT_JOB" && appModel.getProperty("/data/job_dialog_validate") == "OK") {
				var selIndex = this.getView().byId("jobTable").getSelectedIndex();
				if (selIndex >= 0) {
					var oContext = this.getView().byId("jobTable").getContextByIndex(selIndex);
					oModel.update(oContext.getPath(), newEntry, {
						success: function() {
							MessageToast.show("Job updated successfully");
						},
						error: function(err) {
							MessageBox.show("Error while updating Job Entry", {
								title: "Error",
								onClose: null,
								icon: sap.m.MessageBox.Icon.ERROR,
								styleClass: "",
								initialFocus: null,
								textDirection: sap.ui.core.TextDirection.Inherit // default
							});
						}
					});
					oModel.refresh(true);
				}
			}
			if (appModel.getProperty("/data/job_dialog_validate") == "OK") {
				this.getView().byId("jobDialog").close();
			}

		},
		// ============================================================
		// Create new email alert 
		// ============================================================
		onNewUser: function() {
			var appModel = this.getOwnerComponent().getModel("app");
			appModel.setProperty("/data/current_action", "NEW_USER");
			appModel.setProperty("/data/email_field_active", true);
			appModel.setProperty("/data/job/user/USER_EMAIL", "");
			appModel.setProperty("/data/job/user/USER_NAME", "");
			appModel.setProperty("/data/job/user/SUCCESS_ALERT", "");
			appModel.setProperty("/data/job/user/FAILURE_ALERT", "");
			var oView = this.getView();
			var oDialog = oView.byId("userDialog");
			// create dialog lazily
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "burberry.hana.util.view.UserDialog", this);
				oView.addDependent(oDialog);
			}
			oDialog.open();
		},
		// ============================================================
		// Cancel user configuration dialog
		// ============================================================
		onUserCancelDialog: function() {
		    this.resetUserValueState();
			this.getView().byId("userDialog").close();
			
		},
		// ============================================================
		// User setting selected
		// ============================================================
		onUserItemSelected: function() {
			var selIndex = this.getView().byId("userTable").getSelectedIndex();
			var oModel = this.getView().getModel("jobs");
			if (selIndex >= 0) {
				var oPath = this.getView().byId("userTable").getContextByIndex(selIndex).getPath();
				this.getOwnerComponent().getModel("app").setProperty("/data/job/user/USER_EMAIL", oModel.getProperty(oPath + "/USER_EMAIL"));
				this.getOwnerComponent().getModel("app").setProperty("/data/job/user/USER_NAME", oModel.getProperty(oPath + "/USER_NAME"));
				this.getOwnerComponent().getModel("app").setProperty("/data/job/user/SUCCESS_ALERT", oModel.getProperty(oPath + "/SUCCESS_ALERT"));
				this.getOwnerComponent().getModel("app").setProperty("/data/job/user/FAILURE_ALERT", oModel.getProperty(oPath + "/FAILURE_ALERT"));
				window.console.log(this.getOwnerComponent().getModel("app").getProperty("/data/job/user/USER_EMAIL"));
			}
		},
		// ============================================================
		// Edit user email configuration
		// ============================================================
		onEditUser: function() {
			var appModel = this.getOwnerComponent().getModel("app");
			appModel.setProperty("/data/current_action", "EDIT_USER");
			appModel.setProperty("/data/email_field_active", false);
			var selIndex = this.getView().byId("userTable").getSelectedIndex();
			var oView = this.getView();
			if (selIndex >= 0) {
				this.onUserItemSelected();
				var oDialog = oView.byId("userDialog");
				if (!oDialog) {
					// create dialog via fragment factory
					oDialog = sap.ui.xmlfragment(oView.getId(), "burberry.hana.util.view.UserDialog", this);
					oView.addDependent(oDialog);
				}
				oDialog.open();
			} else {
				MessageToast.show("Please select User row first");
			}
		},
		// ============================================================
		// Delete user configuration
		// ============================================================
		onDeleteUser: function() {
			var selIndex = this.getView().byId("userTable").getSelectedIndex();
			var oModel = this.getView().getModel("jobs");
			if (selIndex >= 0) {
				var oContext = this.getView().byId("userTable").getContextByIndex(selIndex);
				MessageBox.show(
					"Are you sure to delete the User from Configuration table?", {
						icon: sap.m.MessageBox.Icon.INFORMATION,
						title: "Confirm",
						actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
						onClose: function(oAction) {
							if (oAction == "YES") {
								oModel.remove(oContext.getPath(), {
									success: function(p) {
										MessageToast.show("User Deleted Successfully");
									},
									error: function(p) {
										MessageToast.show("Problem while deleting user");
									}
								});
								oModel.refresh(true);
							}
						}
					}
				);
			} else {
				MessageToast.show("Please select user row first");
			}
		},
		// ============================================================
		// Submit user settings dialog
		// ============================================================
		onUserSubmitDialog: function() {
			var oModel = this.getView().getModel("jobs");
			var newEntry = {};
			var appModel = this.getOwnerComponent().getModel("app");
			newEntry.JOB_NAME = appModel.getProperty("/data/job/JOB_NAME");
			newEntry.STEP_NAME = appModel.getProperty("/data/job/STEP_NAME");
			newEntry.USER_EMAIL = appModel.getProperty("/data/job/user/USER_EMAIL");
			newEntry.USER_NAME = appModel.getProperty("/data/job/user/USER_NAME");
			newEntry.SUCCESS_ALERT = appModel.getProperty("/data/job/user/SUCCESS_ALERT");
			newEntry.FAILURE_ALERT = appModel.getProperty("/data/job/user/FAILURE_ALERT");
			this.validateUserDialog();
			if (appModel.getProperty("/data/current_action") == "NEW_USER" && appModel.getProperty("/data/user_dialog_validate") == "OK") {
				oModel.create("/Users", newEntry, {
					success: function() {
						MessageToast.show("User Created Successfully");
					},
					error: function(err) {
						MessageBox.show("Error while creating User Entry\nMake sure unique constraint is maintained", {
							title: "Error",
							onClose: null,
							icon: sap.m.MessageBox.Icon.ERROR,
							styleClass: "",
							initialFocus: null,
							textDirection: sap.ui.core.TextDirection.Inherit // default
						});
					}
				});
				oModel.refresh(true);
			}
			if (appModel.getProperty("/data/current_action") == "EDIT_USER" && appModel.getProperty("/data/user_dialog_validate") == "OK") {
				var selIndex = this.getView().byId("userTable").getSelectedIndex();
				if (selIndex >= 0) {
					var oContext = this.getView().byId("userTable").getContextByIndex(selIndex);
					oModel.update(oContext.getPath(), newEntry, {
						success: function() {
							MessageToast.show("User Updated Successfully");
						},
						error: function(err) {
							MessageBox.show("Error while updating User Entry", {
								title: "Error",
								onClose: null,
								icon: sap.m.MessageBox.Icon.ERROR,
								styleClass: "",
								initialFocus: null,
								textDirection: sap.ui.core.TextDirection.Inherit // default
							});
						}
					});
					oModel.refresh(true);
				}
			}
			if(appModel.getProperty("/data/user_dialog_validate") == "OK"){
			    this.getView().byId("userDialog").close();
			}
		},
		// ============================================================
		// Search Jobs
		// ============================================================
		filterJobs: function(oEvent) {
			var sQuery = oEvent.getParameter("query");
			var oFilter = null;
			if (sQuery) {
				oFilter = new Filter([
		            new Filter("JOB_NAME", FilterOperator.Contains, sQuery),
		            new Filter("STEP_NAME", FilterOperator.Contains, sQuery)
		            ], false);
				this.getView().byId("jobTable").getBinding("rows").filter(oFilter, "Application");
			} else {
				this.getView().byId("jobTable").getBinding("rows").filter(null, "Application");
			}

		},
		// ============================================================
		// Search Users
		// ============================================================
		filterUsers: function(oEvent) {
			var sQuery = oEvent.getParameter("query");
			var oFilter = null;
			if (sQuery) {
				oFilter = new Filter([
		            new Filter("USER_EMAIL", FilterOperator.Contains, sQuery),
		            new Filter("USER_NAME", FilterOperator.Contains, sQuery)
		            ], false);
				this.getView().byId("userTable").getBinding("rows").filter(oFilter, "Application");
			} else {
				this.getView().byId("userTable").getBinding("rows").filter(null, "Application");
			}
		},
		// ============================================================
		// Validate user dialog entry
		// ============================================================
		validateJobDialog: function() {
			//job_dialog_validate
			var appModel = this.getOwnerComponent().getModel("app");
			appModel.setProperty("/data/job_dialog_validate", "OK");
			appModel.setProperty("/data/job_value_state", "None");
			appModel.setProperty("/data/step_value_state", "None");
			appModel.setProperty("/data/subject_success_value_state", "None");
			appModel.setProperty("/data/subject_failure_value_state", "None");
			if(appModel.getProperty("/data/job/JOB_NAME").length < 3){
			    appModel.setProperty("/data/job_value_state", "Error");
			    appModel.setProperty("/data/job_dialog_validate", "ERROR");
			}
			if(appModel.getProperty("/data/job/STEP_NAME").length < 3){
			    appModel.setProperty("/data/step_value_state", "Error");
			    appModel.setProperty("/data/job_dialog_validate", "ERROR");
			}
			if(appModel.getProperty("/data/job/SUBJECT_SUCCESS").length < 3){
			    appModel.setProperty("/data/subject_success_value_state", "Error");
			    appModel.setProperty("/data/job_dialog_validate", "ERROR");
			}
			if(appModel.getProperty("/data/job/SUBJECT_FAILURE").length < 3){
			    appModel.setProperty("/data/subject_failure_value_state", "Error");
			    appModel.setProperty("/data/job_dialog_validate", "ERROR");
			}
			
		},
		// ============================================================
		// Reset
		// ============================================================
		resetJobValueState:function(){
            var appModel = this.getOwnerComponent().getModel("app");
            appModel.setProperty("/data/subject_success_value_state", "None");
			appModel.setProperty("/data/subject_failure_value_state", "None");
			appModel.setProperty("/data/job_value_state", "None");
			appModel.setProperty("/data/step_value_state", "None");
			appModel.setProperty("/data/job_dialog_validate", "OK");
		},
		// ============================================================
		// Validate user entry dialog
		// ============================================================
		validateUserDialog:function(){
		   var appModel = this.getOwnerComponent().getModel("app");
		   var mailID = appModel.getProperty("/data/job/user/USER_EMAIL").toLowerCase();
		   
		   appModel.setProperty("/data/user_dialog_validate", "OK");
		   appModel.setProperty("/data/user_email_value_state", "None");
		   appModel.setProperty("/data/user_name_value_state", "None");
		   if(mailID.substring(mailID.length-13, mailID.length)!="@burberry.com"){
			    appModel.setProperty("/data/user_email_value_state", "Error");
			    appModel.setProperty("/data/user_dialog_validate", "ERROR");
			}
			if(appModel.getProperty("/data/job/user/USER_NAME").length < 2){
			    appModel.setProperty("/data/user_name_value_state", "Error");
			    appModel.setProperty("/data/user_dialog_validate", "ERROR");
			}
		},
		// ============================================================
		// Reset Validation for user entry
		// ============================================================
		resetUserValueState:function(){
            var appModel = this.getOwnerComponent().getModel("app");
            appModel.setProperty("/data/user_dialog_validate", "OK");
		   appModel.setProperty("/data/user_email_value_state", "None");
		   appModel.setProperty("/data/user_name_value_state", "None");
		},
		// ============================================================
		// Format inactive
		// ============================================================
		formatInactiveFlag:function(oValue){
		   return oValue!="X" ? true :false; 
		},
		// ============================================================
		// Format active
		// ============================================================
		formatActiveFlag:function(oValue){
		    return oValue=="X" ? true :false; 
		},
		// ============================================================
		// Not used anymore
		// ============================================================
		onNavBack:function(oEvent){
		    var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("home", {}, true);
			}
		}
	});
});