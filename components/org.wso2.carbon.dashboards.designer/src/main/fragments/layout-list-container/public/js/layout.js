/**
* Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
(function () {
	function insertLayout(e, that) {
		e.preventDefault();
		var designer = portal.dashboards.functions.designer;
		var layoutId = that.id;
		//TODO Use i18n for the confirm text message, once available through UUFClient.
		noty({
			text : 'Do you want to discard existing dashboard content and apply ' + layoutId +
			' layout?This action cannot be undone!',
			buttons : [{
			addClass : 'btn',
			text : 'Cancel',
			'layout' : 'center',
			onClick : function($noty) {
				$noty.close();
			}
			}, {
			addClass : 'btn btn-warning',
			text : 'Yes',
			onClick : function($noty) {
				designer.destroyDashboard();
				designer.applyLayout(portal.dashboards.layouts[layoutId]);
			}}]
		});
	}

	portal.dashboards.functions.layout = {
	insertLayout: insertLayout
	};
}());