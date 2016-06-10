/*
 * Copyright (c) 2015, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
    var layouts = [];
    var isStillLoading = false;
    var nextStart = 0;
    var hasMore = true;

    /**
     * Page count.
     * @const
     */
    var layout_COUNT = 10;

    // Pre-compiling handlebar templates
    var layoutsListHbs = Handlebars.compile($("#ues-layouts-list-hbs").html());
    var layoutThumbnailHbs = Handlebars.compile($("#ues-layout-thumbnail-hbs").html());
    var layoutConfirmHbs = Handlebars.compile($("#ues-layout-confirm-hbs").html());
    var layoutsEmptyHbs = Handlebars.compile($("#ues-layouts-empty-hbs").html());
    Handlebars.registerPartial('ues-layout-thumbnail-hbs', layoutThumbnailHbs);

    /**
     * Load the list of layouts available.
     * @private
     * */
    var loadlayouts = function () {
        isStillLoading = true;

        if (!hasMore) {
            isStillLoading = false;
            return;
        }
        ues.store.assets('layout', {
            start: nextStart,
            count: layout_COUNT
        }, function (err, data) {
            var layoutsEl = $('#ues-layouts-portal').find('.ues-layouts');
            hasMore = data.length;
            if (!hasMore && nextStart === 0) {
                layoutsEl.append(layoutsEmptyHbs());
                return;
            }
            nextStart += layout_COUNT;
            layouts = layouts.concat(data);
            layoutsEl.append(layoutsListHbs(data));
            var win = $(window);
            var doc = $(document);
            isStillLoading = false;
            if (doc.height() > win.height()) {
                return;
            }
            loadlayouts();
        });
    };

    /**
     * Find the layout using layout id.
     * @param id
     * @return {object}
     * @private
     * */
    var findlayout = function (id) {
        var index;
        var layout;
        var length = layouts.length;
        for (index = 0; index < length; index++) {
            layout = layouts[index];
            if (layout.id === id) {
                return layout;
            }
        }
    };

    var deletelayout = function(id) {
        ues.store.deleteAsset('layout', id, function (err, data) {
        });
        location.reload();
    };
    /**
     * Initialize the UI functionality such as binding events.
     * @private
     * */
    var initUI = function () {
        var portal = $('#ues-layouts-portal');
        portal.on('click', '.ues-layouts .ues-layout-trash-handle', function (e) {
            e.preventDefault();
            var thiz = $(this);
            var layoutElement = thiz.closest('.ues-layout');
            var id = layoutElement.data('id');
            var layout = findlayout(id);
            layoutElement.html(layoutConfirmHbs(layout));
        });

        portal.on('click', '.ues-layouts .ues-layout-trash-confirm', function (e) {
            e.preventDefault();
            deletelayout($(this).closest('.ues-layout').data('id'));
        });

        portal.on('click', '.ues-layouts .ues-layout-trash-cancel', function (e) {
            e.preventDefault();
            var thiz = $(this);
            var layoutElement = thiz.closest('.ues-layout');
            var id = layoutElement.data('id');
            var dashboard = findlayout(id);
            layoutElement.html(layoutThumbnailHbs(dashboard));
        });

        $(window).scroll(function () {
            var win = $(window);
            var doc = $(document);
            if (win.scrollTop() + win.height() < doc.height() - 100) {
                return;
            }

            if (!isStillLoading) {
                loadlayouts();
            }
        });
    };

    initUI();
    loadlayouts();
});