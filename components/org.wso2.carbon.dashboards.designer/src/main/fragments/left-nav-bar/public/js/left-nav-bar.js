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

/**
 * Update sidebar.
 * @param {String} view     Selector of the sidebar pane
 * @param {Object} button   Event source
 * @return {null}
 */
var updateSidebarNav = function (view, button) {
    var target = $(button).data('target');
    $(view).show();
    $(view).siblings().hide();
    $('.content').show();
    $('.menu').hide();
    $('#btn-sidebar-menu').closest('li').removeClass('active');

    if ($(view).find('button[data-target=#left-sidebar-sub]').length === 0) {
        $('#left-sidebar-sub').hide();
    } else {
        $('#left-sidebar-sub').show();
    }
};
