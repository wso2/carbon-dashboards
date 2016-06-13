/*
 * Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

$(function () {
    var gadgets = [];
    var isStillLoading = false;
    var nextStart = 0;
    var hasMore = true;
    var log = new Log();

    /**
     * gadget count.
     * @const
     */
    var GADGET_COUNT = 10;

    // Pre-compiling handlebar templates
    var gadgetsListHbs = Handlebars.compile($("#ues-gadgets-list-hbs").html());
    var gadgetThumbnailHbs = Handlebars.compile($("#ues-gadget-thumbnail-hbs").html());
    var gadgetConfirmHbs = Handlebars.compile($("#ues-gadget-confirm-hbs").html());
    var gadgetsEmptyHbs = Handlebars.compile($("#ues-gadgets-empty-hbs").html());
    Handlebars.registerPartial('ues-gadget-thumbnail-hbs', gadgetThumbnailHbs);

    /**
     * Load the list of gadgets available.
     * @private
     * */
    var loadGadgets = function () {
        isStillLoading = true;

        if (!hasMore) {
            isStillLoading = false;
            return;
        }
        ues.store.assets('gadget', {
            start: nextStart,
            count: GADGET_COUNT
        }, function (err, data) {
            var gadgetsEl = $('#ues-gadgets-portal').find('.ues-gadgets');
            hasMore = data.length;
            if (!hasMore && nextStart === 0) {
                gadgetsEl.append(gadgetsEmptyHbs());
                return;
            }
            nextStart += GADGET_COUNT;
            gadgets = gadgets.concat(data);
            gadgetsEl.append(gadgetsListHbs(data));
            var win = $(window);
            var doc = $(document);
            isStillLoading = false;
            if (doc.height() > win.height()) {
                return;
            }
            loadGadgets();
        });
    };

    /**
     * Find the gadget using gadget id.
     * @param id
     * @return {object}
     * @private
     * */
    var findGadget = function (id) {
        var index;
        var gadget;
        var length = gadgets.length;
        for (index = 0; index < length; index++) {
            gadget = gadgets[index];
            if (gadget.id === id) {
                return gadget;
            }
        }
    };

    /**
     * To delete the gadget with the given id
     * @param id Id of the gadget to be deleted
     * @private
     */
    var deleteGadget = function (id) {
        ues.store.deleteAsset('gadget', id, function (err, data) {
            if (err) {
                log.error(err);
            }
        });
        location.reload();
    };

    /**
     * Initialize the UI functionality such as binding events.
     * @private
     * */
    var initUI = function () {
        var portal = $('#ues-gadgets-portal');
        portal.on('click', '.ues-gadgets .ues-gadget-trash-handle', function (e) {
            e.preventDefault();
            var thiz = $(this);
            var gadgetElement = thiz.closest('.ues-gadget');
            var id = gadgetElement.data('id');
            var gadget = findGadget(id);
            gadgetElement.html(gadgetConfirmHbs(gadget));
        });

        portal.on('click', '.ues-gadgets .ues-gadget-trash-confirm', function (e) {
            e.preventDefault();
            deleteGadget($(this).closest('.ues-gadget').data('id'));
        });

        portal.on('click', '.ues-gadgets .ues-gadget-trash-cancel', function (e) {
            e.preventDefault();
            var thiz = $(this);
            var gadgetElement = thiz.closest('.ues-gadget');
            var id = gadgetElement.data('id');
            var dashboard = findGadget(id);
            gadgetElement.html(gadgetThumbnailHbs(dashboard));
        });

        $(window).scroll(function () {
            var win = $(window);
            var doc = $(document);
            if (win.scrollTop() + win.height() < doc.height() - 100) {
                return;
            }

            if (!isStillLoading) {
                loadGadgets();
            }
        });
    };

    initUI();
    loadGadgets();
});